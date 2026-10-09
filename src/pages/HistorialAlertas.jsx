
import { useState, useEffect } from 'react';
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla';
import { MockService } from '../services/MockService';
import ModalDetalle from '../components/ModalDetalle';
import styles from './HistorialAlertas.module.css';
import { ColorUrgencia } from '../components/Pilas';


function formatearFecha(fechaISO) {
  if (!fechaISO) return '';

  const coincidencia = String(fechaISO).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!coincidencia) return '';

  return `${coincidencia[3]}-${coincidencia[2]}-${coincidencia[1]}`;
}


function normalizarFecha(valor) {
  if (!valor) return '';

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

  return '';
}

const HistorialAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [mostrarExito, setMostrarExito] = useState(false);

  
  const [busqueda, setBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nivel, setNivel] = useState('');
  const [resultado, setResultado] = useState('');

  const getEstilosSeveridad = (nivelAlerta) => {
    if (nivelAlerta === 'Alto') {
      return { pill: styles.pillAlto, dot: styles.dotAlto };
    }

    if (nivelAlerta === 'Medio') {
      return { pill: styles.pillMedio, dot: styles.dotMedio };
    }

    return { pill: styles.pillBajo, dot: styles.dotBajo };
  };

  const columnasAlertas = [
    {
      clave: 'fecha',
      encabezado: 'Fecha / Hora',
    },
    {
      clave: 'box',
      encabezado: 'Box',
      renderizar: (valor, item) => {
        const estilos = getEstilosSeveridad(item.nivel);

        return (
          <div className={styles.boxContainer}>
            <span className={`${styles.dot} ${estilos.dot}`}></span>
            {valor}
          </div>
        );
      },
    },
    {
      clave: 'nivel',
      encabezado: 'Nivel de Riesgo',
      renderizar: (valor) => <ColorUrgencia valor={valor} />,
    },
    {
      clave: 'estado_evaluacion',
      encabezado: 'Estado',
    },
    {
      clave: 'acciones',
      encabezado: '',
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
        console.error('Error al obtener el historial de alertas:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  
  const alertasEvaluadas = alertas.filter(
    (alerta) =>
      alerta.estado_evaluacion !== null &&
      alerta.estado_evaluacion !== undefined
  );

  
  const alertasFiltradas = alertasEvaluadas.filter((alerta) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(alerta.box ?? '').toLowerCase().includes(texto) ||
      String(alerta.supervisor ?? '').toLowerCase().includes(texto);

    const coincideFecha =
      fecha === '' || normalizarFecha(alerta.fecha) === fecha;

    const coincideCategoria =
      categoria === '' || alerta.categoria === categoria;

    const coincideNivel =
      nivel === '' || alerta.nivel === nivel;

    
    const coincideResultado =
      resultado === '' ||
      String(alerta.estado_evaluacion ?? '')
        .trim()
        .toLowerCase() === resultado;

    return (
      coincideBusqueda &&
      coincideFecha &&
      coincideCategoria &&
      coincideNivel &&
      coincideResultado
    );
  });

  const handleGuardarEvaluacion = (alertaEditada, evaluacion) => {
    setAlertaSeleccionada(null);

    setAlertas((prevAlertas) =>
      prevAlertas.map((a) =>
        a.id === alertaEditada.id
          ? { ...a, estado_evaluacion: evaluacion }
          : a
      )
    );

    setMostrarExito(true);
    setTimeout(() => setMostrarExito(false), 4000);
  };

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
        <h1>Historial de Alertas</h1>
        <p className={styles.subtitulo}>
          Visualiza el registro histórico de todas las alertas
          generadas por los boxes.
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
              La alerta ha sido clasificada y archivada en el historial.
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

      {/* Panel de filtros */}
      <section className={styles.panelFiltros}>
        <h2>Filtrar historial</h2>

        <div className={styles.camposFiltros}>
          {/* Buscar */}
          <div className={styles.campo}>
            <label htmlFor="buscar-historial">Buscar</label>
            <input
              id="buscar-historial"
              type="search"
              placeholder="Box o supervisor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Fecha de detección */}
          <div className={styles.campo}>
            <label htmlFor="fecha-historial">
              Fecha detección
            </label>

            <div className={styles.contenedorFecha}>
              <input
                id="fecha-historial"
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
                  onClick={() => setFecha('')}
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

          {/* Categoría */}
          <div className={styles.campo}>
            <label htmlFor="categoria-historial">
              Categoría
            </label>

            <select
              id="categoria-historial"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="RS">RS</option>
              <option value="VD">VD</option>
            </select>
          </div>

          {/* Nivel de alerta */}
          <div className={styles.campo}>
            <label htmlFor="nivel-historial">
              Nivel de alerta
            </label>

            <select
              id="nivel-historial"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>

          {/* Resultado de evaluación */}
          <div className={styles.campo}>
            <label htmlFor="resultado-historial">
              Resultado de evaluación
            </label>

            <select
              id="resultado-historial"
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="correcta">Correcta</option>
              <option value="neutro">Neutro</option>
              <option value="falso positivo">Falso positivo</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className={styles.pieFiltros}>
          Mostrando {alertasFiltradas.length} de{' '}
          {alertasEvaluadas.length} alertas evaluadas
        </div>
      </section>

      {/* Tabla del historial */}
      {cargando ? (
        <p className={styles.loadingText}>
          Cargando alertas...
        </p>
      ) : (
        <PaginaTabla
          columnas={columnasAlertas}
          datos={alertasFiltradas}
          filtros={[]}
          headerTabla={headerTabla}
        />
      )}

      {/* Modal de detalle */}
      <ModalDetalle
        key={alertaSeleccionada?.id || 'modal-cerrado'}
        alerta={alertaSeleccionada}
        onCerrar={() => setAlertaSeleccionada(null)}
        onGuardar={handleGuardarEvaluacion}
      />
    </div>
  );
};

export default HistorialAlertas;
