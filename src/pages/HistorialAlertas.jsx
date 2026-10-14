
import { useState, useEffect } from "react";
import { PaginaTabla } from "../components/PaginaTabla/PaginaTabla";
import { MockService } from "../services/MockService";
import ModalDetalle from "../components/ModalDetalle";
import styles from "./HistorialAlertas.module.css";
import { ColorUrgencia } from "../components/Pilas";

const HistorialAlertas = ({ titulo = 'Historial de Alertas' }) => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [mostrarExito, setMostrarExito] = useState(false);

  // El contador recibe los resultados desde PaginaTabla.
  const [totalMostrado, setTotalMostrado] = useState(null);

  const getEstilosSeveridad = (nivelAlerta) => {
    if (nivelAlerta === "Alto") {
      return {
        pill: styles.pillAlto,
        dot: styles.dotAlto,
      };
    }

    if (nivelAlerta === "Medio") {
      return {
        pill: styles.pillMedio,
        dot: styles.dotMedio,
      };
    }

    return {
      pill: styles.pillBajo,
      dot: styles.dotBajo,
    };
  };

  const columnasAlertas = [
    {
      clave: "fecha",
      encabezado: "Fecha / Hora",
    },
    {
      clave: "box",
      encabezado: "Box",
      renderizar: (valor, item) => {
        const estilos = getEstilosSeveridad(item.nivel);

        return (
          <div className={styles.boxContainer}>
            <span
              className={`${styles.dot} ${estilos.dot}`}
            ></span>
            {valor}
          </div>
        );
      },
    },
    {
      clave: "nivel",
      encabezado: "Nivel de Riesgo",
      renderizar: (valor) => (
        <ColorUrgencia valor={valor} />
      ),
    },
    {
      clave: "estado_evaluacion",
      encabezado: "Estado",
    },
    {
      clave: "acciones",
      encabezado: "",
      renderizar: (_, item) => (
        <button
          type="button"
          onClick={() => setAlertaSeleccionada(item)}
          className={styles.btnAccion}
        >
          Ver detalle
        </button>
      ),
    },
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const datosMock = await MockService.listarAlertas();
        setAlertas(datosMock);
      } catch (error) {
        console.error(
          "Error al obtener el historial de alertas:",
          error
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // El historial solamente muestra alertas evaluadas.
  const alertasEvaluadas = alertas.filter(
    (alerta) =>
      alerta.estado_evaluacion !== null &&
      alerta.estado_evaluacion !== undefined
  );

  // La página solamente configura los filtros.
  // PaginaTabla se encarga de administrarlos y aplicarlos.
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
      etiqueta: "Nivel de alerta",
      tipo: "select",
      opciones: ["Bajo", "Medio", "Alto"],
    },
    {
      clave: "estado_evaluacion",
      etiqueta: "Resultado de evaluación",
      tipo: "select",
      ignorarMayusculas: true,
      opciones: [
        {
          valor: "correcta",
          etiqueta: "Correcta",
        },
        {
          valor: "neutro",
          etiqueta: "Neutro",
        },
        {
          valor: "falso positivo",
          etiqueta: "Falso positivo",
        },
      ],
    },
  ];

  const handleGuardarEvaluacion = (
    alertaEditada,
    evaluacion
  ) => {
    setAlertaSeleccionada(null);

    setAlertas((prevAlertas) =>
      prevAlertas.map((alerta) =>
        alerta.id === alertaEditada.id
          ? {
              ...alerta,
              estado_evaluacion: evaluacion,
            }
          : alerta
      )
    );

    setMostrarExito(true);
    setTimeout(() => setMostrarExito(false), 4000);
  };

  const headerFiltros = (
    <h2>Filtrar historial</h2>
  );

  const headerTabla = (
    <div className={styles.titulo}>
      <h2>Registro de alertas</h2>
      <p className={styles.subtitulo}>
        Cada registro identifica cuándo ocurrió la alerta,
        número de box y el nivel de riesgo.
      </p>
    </div>
  );

  return (
    <div>
      {/* Encabezado */}
      <div className={styles.header}>
        <h1>{titulo}</h1>

        <p className={styles.subtitulo}>
          Visualiza el registro histórico de todas las
          alertas generadas por los boxes.
        </p>
      </div>

      {/* Mensaje de evaluación exitosa */}
      {mostrarExito && (
        <div className={styles.toastExito}>
          <div className={styles.toastIconContainer}>
            <svg
              className={styles.toastIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className={styles.toastContent}>
            <p className={styles.toastTitle}>
              Evaluación registrada correctamente
            </p>

            <p className={styles.toastMessage}>
              La alerta ha sido clasificada y archivada
              en el historial.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarExito(false)}
            className={styles.toastCloseBtn}
            aria-label="Cerrar notificación"
          >
            <svg
              className={styles.toastIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Tabla y filtros administrados por PaginaTabla */}
      {cargando ? (
        <p className={styles.loadingText}>
          Cargando alertas...
        </p>
      ) : (
        <>
          <PaginaTabla
            columnas={columnasAlertas}
            datos={alertasEvaluadas}
            filtros={filtros}
            headerFiltros={headerFiltros}
            headerTabla={headerTabla}
            onResultadosChange={setTotalMostrado}
          />

          {/* Contador de resultados */}
          <div className={styles.pieFiltros}>
            Mostrando{" "}
            {totalMostrado ?? alertasEvaluadas.length} de{" "}
            {alertasEvaluadas.length} alertas evaluadas
          </div>
        </>
      )}

      {/* Modal de detalle */}
      <ModalDetalle
        key={alertaSeleccionada?.id || "modal-cerrado"}
        alerta={alertaSeleccionada}
        onCerrar={() => setAlertaSeleccionada(null)}
        onGuardar={handleGuardarEvaluacion}
      />
    </div>
  );
};

export default HistorialAlertas;
