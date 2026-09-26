import { useState, useEffect, useMemo } from "react";
import styles from "./ConfiguracionForm.module.css";

const MIN_OPERACION = 480; // 08:00 en minutos
const MAX_OPERACION = 1320; // 22:00 en minutos

function generarHoras() {
  const horas = [];
  for (let min = MIN_OPERACION; min <= MAX_OPERACION; min += 10) {
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    horas.push(`${h}:${m}`);
  }
  return horas;
}

const TODAS_LAS_HORAS = generarHoras();

function aMinutos(valor) {
  const [h, m] = valor.split(":").map(Number);
  return h * 60 + m;
}

function esCorreoValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

/**
 * @param {{ horaInicio: string, horaTermino: string, correoCliente: string }} valoresIniciales
 * @param {(nuevaConfig: Object) => Promise<void>} onGuardar
 */
export function ConfiguracionForm({ valoresIniciales, onGuardar }) {
  const [horaInicio, setHoraInicio] = useState(valoresIniciales.horaInicio);
  const [horaTermino, setHoraTermino] = useState(valoresIniciales.horaTermino);
  const [correo, setCorreo] = useState(valoresIniciales.correoCliente);
  const [guardando, setGuardando] = useState(false);
  const [guardadoReciente, setGuardadoReciente] = useState(false);

  useEffect(() => {
    setHoraInicio(valoresIniciales.horaInicio);
    setHoraTermino(valoresIniciales.horaTermino);
    setCorreo(valoresIniciales.correoCliente);
  }, [valoresIniciales]);

  const opcionesInicio = useMemo(
    () => TODAS_LAS_HORAS.filter((h) => aMinutos(h) < aMinutos(horaTermino)),
    [horaTermino]
  );
  const opcionesTermino = useMemo(
    () => TODAS_LAS_HORAS.filter((h) => aMinutos(h) > aMinutos(horaInicio)),
    [horaInicio]
  );

  const correoEsValido = correo.trim() !== "" && esCorreoValido(correo);
  const correoEstado = correo.trim() === "" ? "pendiente" : correoEsValido ? "valido" : "invalido";

  const hayCambios =
    horaInicio !== valoresIniciales.horaInicio ||
    horaTermino !== valoresIniciales.horaTermino ||
    correo.trim() !== valoresIniciales.correoCliente;

  const puedeGuardar = hayCambios && correoEsValido && !guardando;
  const puedeReiniciar = hayCambios && !guardando;

  const pct = (valor) => ((aMinutos(valor) - MIN_OPERACION) / (MAX_OPERACION - MIN_OPERACION)) * 100;

  const dif = aMinutos(horaTermino) - aMinutos(horaInicio);
  const horas = Math.floor(dif / 60);
  const minutos = dif % 60;
  const duracionTexto = minutos === 0 ? `${horas} horas` : horas < 1 ? `${minutos} minutos` : `${horas} h ${minutos} min`;

  function handleHoraInicioChange(valor) {
    setHoraInicio(valor);
    setGuardadoReciente(false);
  }

  function handleHoraTerminoChange(valor) {
    setHoraTermino(valor);
    setGuardadoReciente(false);
  }

  function handleCorreoChange(valor) {
    setCorreo(valor);
    setGuardadoReciente(false);
  }

  async function handleGuardar() {
    if (!puedeGuardar) return;
    setGuardando(true);
    try {
      await onGuardar({ horaInicio, horaTermino, correoCliente: correo.trim() });
      setGuardadoReciente(true);
    } finally {
      setGuardando(false);
    }
  }

  function handleReiniciar() {
    setHoraInicio(valoresIniciales.horaInicio);
    setHoraTermino(valoresIniciales.horaTermino);
    setCorreo(valoresIniciales.correoCliente);
    setGuardadoReciente(false);
  }

  return (
    <div className={styles.contenedor}>
      {guardadoReciente && !hayCambios && (
        <div className={styles.bannerExito}>
          <span>Configuración guardada correctamente</span>
          <button type="button" onClick={() => setGuardadoReciente(false)} aria-label="Cerrar mensaje">×</button>
        </div>
      )}

      <section className={styles.seccion}>
        <h2>Horario de operación</h2>
        <p className={styles.descripcion}>
          El sistema solo captura y procesa los boxes dentro de este rango configurable.
        </p>

        <div className={styles.selectoresHora}>
          <label className={styles.campo}>
            Hora de inicio
            <select value={horaInicio} onChange={(e) => handleHoraInicioChange(e.target.value)}>
              {opcionesInicio.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
          <label className={styles.campo}>
            Hora de término
            <select value={horaTermino} onChange={(e) => handleHoraTerminoChange(e.target.value)}>
              {opcionesTermino.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.timeline}>
          <div
            className={styles.timelineFill}
            style={{ left: `${pct(horaInicio)}%`, right: `${100 - pct(horaTermino)}%` }}
          />
        </div>

        <div className={styles.resumen}>
          Rango configurado: <strong>{horaInicio}</strong> a <strong>{horaTermino}</strong>
          <span className={styles.duracion}>Duración: {duracionTexto}</span>
        </div>
      </section>

      <section className={styles.seccion}>
        <h2>Canales de contingencia</h2>
        <p className={styles.descripcion}>
          Define el canal alternativo que recibe la alerta cuando el supervisor no está disponible o Teams falla.
        </p>

        <label className={styles.campo}>
          Correo del cliente <span className={styles.opcional}>(canal alternativo)</span>
          <input
            type="email"
            value={correo}
            placeholder="cliente@dominio.cl"
            onChange={(e) => handleCorreoChange(e.target.value)}
            className={
              correoEstado === "valido" ? styles.inputValido
              : correoEstado === "invalido" ? styles.inputInvalido
              : ""
            }
          />
        </label>
        {correoEstado === "valido" && <p className={styles.mensajeValido}>Formato de correo válido</p>}
        {correoEstado === "invalido" && <p className={styles.mensajeInvalido}>Ingresá un correo válido. Ej: ejemplo@dominio.cl</p>}
      </section>

      <div className={styles.acciones}>
        <span className={hayCambios ? styles.chipPendiente : styles.chipSinCambios}>
          {hayCambios ? "Cambios sin guardar" : "Sin cambios"}
        </span>
        <div className={styles.botones}>
          <button type="button" disabled={!puedeReiniciar} onClick={handleReiniciar}>
            Reiniciar valores
          </button>
          <button type="button" disabled={!puedeGuardar} onClick={handleGuardar} className={styles.botonPrimario}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}