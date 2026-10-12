
import { useEffect, useState } from "react";
import { PaginaTabla } from "../components/PaginaTabla/PaginaTabla";
import ModalDetalle from "../components/ModalDetalle";
import { MockService } from "../services/MockService";
import { ColorUrgencia } from "../components/Pilas";
import styles from "./Alertas.module.css";

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");

  
  const [totalMostrado, setTotalMostrado] = useState(null);

  useEffect(() => {
    async function cargarAlertas() {
      try {
        setCargando(true);
        setError("");

        const datos = await MockService.listarAlertas();
        setAlertas(datos);
      } catch (err) {
        console.error("Error al cargar alertas:", err);
        setError("No se pudieron cargar las alertas.");
      } finally {
        setCargando(false);
      }
    }

    cargarAlertas();
  }, []);

  
  const alertasPendientes = alertas.filter(
    (alerta) => alerta.estado_evaluacion === null
  );

  
  const filtros = [
    {
      clave: "busqueda",
      etiqueta: "Buscar",
      tipo: "texto",
      campos: ["box", "supervisor"],
      placeholder: "Box o supervisor...",
    },
    {
      clave: "fecha",
      etiqueta: "Fecha detección",
      tipo: "fecha",
    },
    {
      clave: "categoria",
      etiqueta: "Categoría",
      tipo: "select",
      opciones: ["RS", "VD"],
    },
    {
      clave: "nivel",
      etiqueta: "Nivel",
      tipo: "select",
      opciones: ["Bajo", "Medio", "Alto"],
    },
  ];

  const columnas = [
    {
      clave: "box",
      encabezado: "Box",
    },
    {
      clave: "categoria",
      encabezado: "Categoría",
    },
    {
      clave: "nivel",
      encabezado: "Nivel de alerta",
      renderizar: (valor) => <ColorUrgencia valor={valor} />,
    },
    {
      clave: "fecha",
      encabezado: "Fecha",
    },
    {
      clave: "hora",
      encabezado: "Hora",
    },
    {
      clave: "supervisor",
      encabezado: "Supervisor",
    },
  ];

  function guardarEvaluacion(alerta, evaluacion) {
    setAlertas((anteriores) =>
      anteriores.map((item) =>
        item.id === alerta.id
          ? { ...item, estado_evaluacion: evaluacion }
          : item
      )
    );

    setAlertaSeleccionada(null);
    setMensajeExito("Alerta clasificada correctamente.");
  }

  const headerFiltros = (
    <div>
      <h2>Filtrar alertas</h2>
    </div>
  );

  const headerTabla = (
    <div>
      <h2>Alertas pendientes de evaluación</h2>
      <p>
        Selecciona una alerta para revisar su detalle
        y clasificarla.
      </p>
    </div>
  );

  return (
    <div className={styles.pagina}>
      {/* Encabezado */}
      <header className={styles.encabezado}>
        <div>
          <h1>Alertas</h1>
          <p>
            {alertasPendientes.length} alertas pendientes de evaluación
          </p>
        </div>

        <span className={styles.estadoMonitoreo}>
          <span className={styles.puntoActivo}></span>
          Monitoreo activo
        </span>
      </header>

      {/* Mensaje de clasificación */}
      {mensajeExito && (
        <div className={styles.exito} role="status">
          <span>{mensajeExito}</span>

          <button
            type="button"
            onClick={() => setMensajeExito("")}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* PaginaTabla administra todos los filtros */}
      {cargando ? (
        <p>Cargando alertas...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <PaginaTabla
            datos={alertasPendientes}
            columnas={columnas}
            filtros={filtros}
            itemsPorPagina={6}
            headerFiltros={headerFiltros}
            headerTabla={headerTabla}
            mensajeVacio="No hay alertas pendientes de clasificación."
            resumenPaginacion
            alSeleccionarFila={setAlertaSeleccionada}
            onResultadosChange={setTotalMostrado}
          />

          {/* Contador y leyenda */}
          <div className={styles.pieFiltros}>
            <span>
              Mostrando {totalMostrado ?? alertasPendientes.length} de{" "}
              {alertasPendientes.length}
            </span>

            <div className={styles.leyenda}>
              <span>
                <i className={styles.puntoBajo}></i>
                Bajo
              </span>

              <span>
                <i className={styles.puntoMedio}></i>
                Medio
              </span>

              <span>
                <i className={styles.puntoAlto}></i>
                Alto
              </span>
            </div>
          </div>
        </>
      )}

      {/* Modal de clasificación */}
      <ModalDetalle
        key={alertaSeleccionada?.id ?? "cerrado"}
        alerta={alertaSeleccionada}
        onCerrar={() => setAlertaSeleccionada(null)}
        onGuardar={guardarEvaluacion}
      />
    </div>
  );
}
