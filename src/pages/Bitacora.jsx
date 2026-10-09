
import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { PaginaTabla } from "../components/PaginaTabla/PaginaTabla";
import { ColorUrgencia, ColorNivel } from "../components/Pilas";
import Modal from "../components/Modal";
import BitacoraRepository from "../services/BitacoraRepository";

import styles from "./Bitacora.module.css";


function formatearFecha(fechaISO) {
  if (!fechaISO) return "";

  const coincidencia = String(fechaISO).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!coincidencia) return "";

  return `${coincidencia[3]}-${coincidencia[2]}-${coincidencia[1]}`;
}


function normalizarFecha(valor) {
  if (!valor) return "";

  const texto = String(valor).trim();

  const fechaISO = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/
  );

  if (fechaISO) {
    return `${fechaISO[1]}-${fechaISO[2]}-${fechaISO[3]}`;
  }

  const fechaLocal = texto.match(
    /^(\d{2})[-/](\d{2})[-/](\d{4})(?:$|[T\s])/
  );

  if (fechaLocal) {
    return `${fechaLocal[3]}-${fechaLocal[2]}-${fechaLocal[1]}`;
  }

  return "";
}

const Registro = ({ valor, item }) => {
  const [verModal, setVerModal] = useState(false);

  return (
    <>
      <div>
        <ChevronRight
          className={styles.masDetallesButton}
          onClick={() => setVerModal(true)}
        />
      </div>

      {verModal && (
        <Modal
          alCerrar={() => setVerModal(false)}
          className={styles.modal}
        >
          <div>
            <h1>Detalles del registro</h1>
            <p>Registro completo del evento.</p>

            <div className={styles.modalDetalle}>
              <p className={styles.modalTitulo}>Fecha</p>
              <p className={styles.modalDato}>{item.fecha}</p>
            </div>

            <div className={styles.modalDetalle}>
              <p className={styles.modalTitulo}>Hora</p>
              <p className={styles.modalDato}>{item.hora}</p>
            </div>

            <div className={styles.modalDetalle}>
              <p className={styles.modalTitulo}>Nivel</p>
              <ColorNivel valor={item.nivel} />
            </div>

            <div className={styles.modalDetalle}>
              <p className={styles.modalTitulo}>Usuario</p>
              <p className={styles.modalDato}>{item.usuario}</p>
            </div>

            <div className={styles.modalDetalle}>
              <p className={styles.modalTitulo}>Descripción</p>
              <p className={styles.modalDato}>{item.descripcion}</p>
            </div>

            {item.alerta && (
              <>
                <h3>Detalle de la alerta asociada</h3>

                <div className={styles.modalAlertaContenedor}>
                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>Box</p>
                    <p className={styles.modalAlertaDato}>Box 5</p>
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Tipo de detección
                    </p>
                    <p className={styles.modalAlertaDato}>
                      Vulneración de derechos (VD)
                    </p>
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Fecha de detección
                    </p>
                    <p className={styles.modalAlertaDato}>
                      27/03/2026
                    </p>
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Hora de detección
                    </p>
                    <p className={styles.modalAlertaDato}>
                      13:32
                    </p>
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Supervisor
                    </p>
                    <p className={styles.modalAlertaDato}>
                      roberto.rober2@psicocam.cl
                    </p>
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Nivel de urgencia
                    </p>
                    <ColorUrgencia valor={"Bajo"} />
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Nivel de urgencia
                    </p>
                    <ColorUrgencia valor={"Medio"} />
                  </div>

                  <div className={styles.modalAlertaDetalle}>
                    <p className={styles.modalAlertaTitulo}>
                      Nivel de urgencia
                    </p>
                    <ColorUrgencia valor={"Alto"} />
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              className={styles.modalButton}
              onClick={() => setVerModal(false)}
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default function Bitacora({ rutasDisponibles = [], alEnviar }) {
  
  const [fecha, setFecha] = useState("");
  const [usuario, setUsuario] = useState("");
  const [nivelFiltro, setNivelFiltro] = useState("");

  const rep = new BitacoraRepository();
  const datos = rep.ObtenerRegistros();

  
  const datosFiltrados = datos.filter((registro) => {
    const coincideFecha =
      fecha === "" ||
      normalizarFecha(registro.fecha || registro.fechaHora) === fecha;

    const coincideUsuario =
      usuario === "" || registro.usuario === usuario;

    const coincideNivel =
      nivelFiltro === "" || registro.nivel === nivelFiltro;

    return coincideFecha && coincideUsuario && coincideNivel;
  });

  const columnas = [
    {
      clave: "fechaHora",
      encabezado: "Fecha/Hora",
    },
    {
      clave: "usuario",
      encabezado: "Usuario",
    },
    {
      clave: "nivel",
      encabezado: "Nivel",
      renderizar: (valor) => <ColorNivel valor={valor} />,
    },
    {
      clave: "descripcion",
      encabezado: "Descripción",
    },
    {
      clave: "noExiste",
      encabezado: "Más Detalles",
      renderizar: (valor, item) => (
        <Registro valor={valor} item={item} />
      ),
    },
  ];

  const headerTabla = (
    <div className={styles.titulo}>
      <h2>Registro de eventos</h2>
      <p className={styles.subtitulo}>
        Cada registro identifica cuándo ocurrió el evento,
        su responsable y el detalle.
      </p>
    </div>
  );

  const usuariosDisponibles = [
    ...new Set(datos.map((registro) => registro.usuario)),
  ].filter(Boolean);

  return (
    <div>
      {/* Encabezado */}
      <div className={styles.header}>
        <h1>Bitácora y auditoría</h1>
        <p className={styles.subtitulo}>
          Trazabilidad de alertas, notificaciones, evaluaciones
          y eventos técnicos del sistema.
        </p>
      </div>

      {/* Panel unificado de filtros */}
      <section className={styles.panelFecha}>
        <h2 className={styles.tituloFiltros}>Filtros</h2>

        <p className={styles.subtitulo}>
          Consulta eventos por fecha, usuarios o nivel del evento.
        </p>

        <div className={styles.camposFiltros}>
          {/* Fecha del evento */}
          <div className={styles.campoFecha}>
            <label htmlFor="fecha-bitacora">
              Fecha del evento
            </label>

            <div className={styles.contenedorFecha}>
              <input
                id="fecha-bitacora"
                type="text"
                placeholder="dd-mm-aaaa"
                value={formatearFecha(fecha)}
                readOnly
                className={styles.entradaFecha}
              />

              {fecha && (
                <button
                  type="button"
                  className={styles.limpiarFecha}
                  onClick={() => setFecha("")}
                  aria-label="Limpiar fecha"
                  title="Limpiar fecha"
                >
                  ×
                </button>
              )}

              <input
                type="date"
                lang="es-CL"
                aria-label="Seleccionar fecha desde calendario"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={styles.selectorCalendario}
              />
            </div>
          </div>

          {/* Usuario */}
          <div className={styles.campoFiltro}>
            <label htmlFor="usuario-bitacora">
              Usuario
            </label>

            <select
              id="usuario-bitacora"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            >
              <option value="">Todos</option>

              {usuariosDisponibles.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel */}
          <div className={styles.campoFiltro}>
            <label htmlFor="nivel-bitacora">
              Nivel
            </label>

            <select
              id="nivel-bitacora"
              value={nivelFiltro}
              onChange={(e) => setNivelFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Información">Información</option>
              <option value="Advertencia">Advertencia</option>
              <option value="Grave">Grave</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <p className={styles.contadorFiltros}>
          Mostrando {datosFiltrados.length} de {datos.length} registros
        </p>
      </section>

      {/* Tabla de eventos */}
      <PaginaTabla
        datos={datosFiltrados}
        columnas={columnas}
        filtros={[]}
        headerTabla={headerTabla}
      />
    </div>
  );
}
