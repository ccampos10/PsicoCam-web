
import { useEffect, useState } from 'react';
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla';
import ModalDetalle from '../components/ModalDetalle';
import { MockService } from '../services/MockService';
import { ColorUrgencia } from '../components/Pilas';
import styles from './Alertas.module.css';

// Convierte una fecha ISO al formato dd-mm-aaaa.
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';

  const coincidencia = String(fechaISO).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!coincidencia) return '';

  return `${coincidencia[3]}-${coincidencia[2]}-${coincidencia[1]}`;
}

// Normaliza las fechas de los registros para poder compararlas.
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

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nivel, setNivel] = useState('');

  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    async function cargarAlertas() {
      try {
        setCargando(true);

        const datos = await MockService.listarAlertas();
        setAlertas(datos);
      } catch (err) {
        console.error('Error al cargar alertas:', err);
        setError('No se pudieron cargar las alertas.');
      } finally {
        setCargando(false);
      }
    }

    cargarAlertas();
  }, []);

  // Solo alertas pendientes de evaluación.
  const alertasPendientes = alertas.filter(
    (alerta) => alerta.estado_evaluacion === null
  );

  // Filtrado combinado.
  const alertasFiltradas = alertasPendientes.filter((alerta) => {
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

    return (
      coincideBusqueda &&
      coincideFecha &&
      coincideCategoria &&
      coincideNivel
    );
  });

  const columnas = [
    {
      clave: 'box',
      encabezado: 'Box',
    },
    {
      clave: 'categoria',
      encabezado: 'Categoría',
    },
    {
      clave: 'nivel',
      encabezado: 'Nivel de alerta',
      renderizar: (valor) => <ColorUrgencia valor={valor} />,
    },
    {
      clave: 'fecha',
      encabezado: 'Fecha',
    },
    {
      clave: 'hora',
      encabezado: 'Hora',
    },
    {
      clave: 'supervisor',
      encabezado: 'Supervisor',
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
    setMensajeExito('Alerta clasificada correctamente.');
  }

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

      {/* Mensaje al clasificar */}
      {mensajeExito && (
        <div className={styles.exito} role="status">
          <span>{mensajeExito}</span>

          <button
            type="button"
            onClick={() => setMensajeExito('')}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* Panel de filtros */}
      <section className={styles.panelFiltros}>
        <h2>Filtrar alertas</h2>

        <div className={styles.camposFiltros}>
          {/* Buscar */}
          <div className={styles.campo}>
            <label htmlFor="buscar-alerta">Buscar</label>

            <input
              id="buscar-alerta"
              type="search"
              placeholder="Box o supervisor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Fecha de detección */}
<div className={styles.campo}>
  <label htmlFor="fecha-alerta">Fecha detección</label>

  <div className={styles.contenedorFecha}>
    <input
      id="fecha-alerta"
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
            <label htmlFor="categoria-alerta">
              Categoría
            </label>

            <select
              id="categoria-alerta"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="RS">RS</option>
              <option value="VD">VD</option>
            </select>
          </div>

          {/* Nivel */}
          <div className={styles.campo}>
            <label htmlFor="nivel-alerta">
              Nivel
            </label>

            <select
              id="nivel-alerta"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>
        </div>

        {/* Resultados y leyenda */}
        <div className={styles.pieFiltros}>
          <span>
            Mostrando {alertasFiltradas.length} de{' '}
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
      </section>

      {/* Tabla de alertas pendientes */}
      {cargando ? (
        <p>Cargando alertas...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <PaginaTabla
          datos={alertasFiltradas}
          columnas={columnas}
          filtros={[]}
          itemsPorPagina={6}
          headerTabla={
            <div>
              <h2>Alertas pendientes de evaluación</h2>
              <p>
                Selecciona una alerta para revisar su detalle
                y clasificarla.
              </p>
            </div>
          }
          mensajeVacio="No hay alertas pendientes de clasificación."
          resumenPaginacion
          alSeleccionarFila={setAlertaSeleccionada}
        />
      )}

      {/* Modal para revisar y clasificar alertas */}
      <ModalDetalle
        key={alertaSeleccionada?.id ?? 'cerrado'}
        alerta={alertaSeleccionada}
        onCerrar={() => setAlertaSeleccionada(null)}
        onGuardar={guardarEvaluacion}
      />
    </div>
  );
}
