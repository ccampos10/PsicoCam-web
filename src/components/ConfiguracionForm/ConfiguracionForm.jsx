import { useState, useMemo } from "react";
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

/**
 * @param {{ horaInicio: string, horaTermino: string, correoCliente: string }} valoresIniciales
 * @param {(nuevaConfig: Object) => Promise<void>} onGuardar
 */
export function ConfiguracionForm({ valoresIniciales, onGuardar, esAdmin = false }) {
  const [guardadoReciente, setGuardadoReciente] = useState(false);
  return <EditorConfiguracion key={JSON.stringify(valoresIniciales)} valoresIniciales={valoresIniciales} onGuardar={onGuardar} esAdmin={esAdmin} guardadoReciente={guardadoReciente} setGuardadoReciente={setGuardadoReciente} />;
}
function EditorConfiguracion({ valoresIniciales, onGuardar, esAdmin, guardadoReciente, setGuardadoReciente }) {
  const [horaInicio, setHoraInicio] = useState(valoresIniciales.horaInicio);
  const [horaTermino, setHoraTermino] = useState(valoresIniciales.horaTermino);
  const [correo, setCorreo] = useState(valoresIniciales.correoCliente);
  const [modoCorreo, setModoCorreo] = useState(valoresIniciales.modoCorreo || 'asignado');
  const [incluirAdministradores, setIncluirAdministradores] = useState(valoresIniciales.incluirAdministradores === true);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');


  const opcionesInicio = useMemo(
    () => TODAS_LAS_HORAS.filter((h) => aMinutos(h) < aMinutos(horaTermino)),
    [horaTermino]
  );
  const opcionesTermino = useMemo(
    () => TODAS_LAS_HORAS.filter((h) => aMinutos(h) > aMinutos(horaInicio)),
    [horaInicio]
  );

  const hayCambios =
    horaInicio !== valoresIniciales.horaInicio ||
    horaTermino !== valoresIniciales.horaTermino ||
    correo.trim() !== valoresIniciales.correoCliente;
  const hayCambiosCorreo = modoCorreo !== (valoresIniciales.modoCorreo || 'asignado') || incluirAdministradores !== (valoresIniciales.incluirAdministradores === true);

  const hayCambiosTotales = hayCambios || hayCambiosCorreo;
  const puedeGuardar = esAdmin && hayCambiosTotales && !guardando;
  const puedeReiniciar = esAdmin && hayCambiosTotales && !guardando;

  const pct = (valor) => (aMinutos(valor) / 1440) * 100;

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

  async function handleGuardar() {
    if (!puedeGuardar) return;
    setGuardando(true);
    setErrorGuardado('');
    try {
      await onGuardar({ horaInicio, horaTermino, correoCliente: correo.trim(), modoCorreo, incluirAdministradores });
      setGuardadoReciente(true);
    } catch (fallo) {
      setErrorGuardado(fallo.message || 'No se pudo guardar la configuracion.');
    } finally {
      setGuardando(false);
    }
  }

  function handleReiniciar() {
    setHoraInicio(valoresIniciales.horaInicio);
    setHoraTermino(valoresIniciales.horaTermino);
    setCorreo(valoresIniciales.correoCliente);
    setModoCorreo(valoresIniciales.modoCorreo || 'asignado');
    setIncluirAdministradores(valoresIniciales.incluirAdministradores === true);
    setGuardadoReciente(false);
  }

  if (!esAdmin) return null;

  return (
    <div className={styles.contenedor}>
      {guardadoReciente && !hayCambiosTotales && (
        <div className={styles.bannerExito}>
          <span>Configuración guardada correctamente</span>
          <button type="button" onClick={() => setGuardadoReciente(false)} aria-label="Cerrar mensaje">×</button>
        </div>
      )}

      <section className={styles.seccion}>
        <div className={styles.encabezadoSeccion}><h2>Horario de operación</h2><span className={styles.etiquetaAdmin}>Administrador</span></div>
        <p className={styles.descripcion}>
          Define el horario de operación registrado para el sistema.
        </p>
        <p className={styles.horarioEstado}>Horario seleccionado · {horaInicio} – {horaTermino}</p>

        <div className={styles.selectoresHora}>
          <label className={styles.campo}>
            Hora de inicio
            <select disabled={!esAdmin || guardando} value={horaInicio} onChange={(e) => handleHoraInicioChange(e.target.value)}>
              {opcionesInicio.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
          <label className={styles.campo}>
            Hora de término
            <select disabled={!esAdmin || guardando} value={horaTermino} onChange={(e) => handleHoraTerminoChange(e.target.value)}>
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

        <div className={styles.marcasHora} aria-hidden="true"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>

        <div className={styles.resumen}>
          Rango configurado: <strong>{horaInicio}</strong> a <strong>{horaTermino}</strong>
          <span className={styles.duracion}>Duración: {duracionTexto}</span>
        </div>
      </section>

      <section className={styles.seccion}>
        <div className={styles.encabezadoSeccion}><h2>Notificaciones por correo</h2><span className={styles.etiquetaAdmin}>Administrador</span></div>
        <p className={styles.descripcion}>Elige quiénes deben recibir los correos de alerta.</p>
        <fieldset className={styles.opcionesCorreo} disabled={!esAdmin || guardando}>
          <legend>Destinatarios principales</legend>
          <label><input type="radio" name="destinatarios" value="asignado" checked={modoCorreo === 'asignado'} onChange={() => setModoCorreo('asignado')} /><span><strong>Usuario asignado a la alerta</strong><small>Enviar al supervisor asociado al box.</small></span></label>
          <label><input type="radio" name="destinatarios" value="todos" checked={modoCorreo === 'todos'} onChange={() => setModoCorreo('todos')} /><span><strong>Todos los usuarios activos</strong><small>Enviar a la lista de cuentas activas del sistema.</small></span></label>
          <label><input type="checkbox" checked={incluirAdministradores} onChange={evento => setIncluirAdministradores(evento.target.checked)} /><span><strong>Enviar también a todos los administradores activos</strong><small>Se agregan sin duplicar destinatarios.</small></span></label>
        </fieldset>
        <p className={styles.avisoEnvio}>La selección se guarda, pero aún no está conectada al envío automático de alertas.</p>
        {!esAdmin && <p className={styles.descripcion}>Solo un administrador puede cambiar esta configuración.</p>}
      </section>

      {/* Sección */}
      <section className={styles.seccion}>
        <div className={styles.encabezadoSeccion}>
          <h2>Correo de respaldo</h2>
          <span className={styles.etiquetaAdmin}>Administrador</span>
        </div>
        <p className={styles.descripcion}>
          Ingresa un correo secundario para recibir respaldo de las notificaciones o alertas.
        </p>
        <label className={styles.campo}>
          Correo electrónico
          <input
            type="email"
            disabled={!esAdmin || guardando}
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              setGuardadoReciente(false);
            }}
            placeholder="ejemplo@psicocam.cl"
          />
        </label>
      </section>

      <div className={styles.acciones}>
        {errorGuardado && <p role="alert">{errorGuardado}</p>}
        <span className={hayCambiosTotales ? styles.chipPendiente : styles.chipSinCambios}>
          {hayCambiosTotales ? "Cambios sin guardar" : "Sin cambios"}
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