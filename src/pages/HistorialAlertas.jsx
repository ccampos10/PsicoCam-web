import { useState, useEffect } from 'react';
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla';
import { api } from '../services/api'
import ModalDetalle from '../components/ModalDetalle';
import styles from './HistorialAlertas.module.css';
import { ColorUrgencia } from '../components/Pilas';

const HistorialAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [mostrarExito, setMostrarExito] = useState(false); // Estado para el toast

  const getEstilosSeveridad = (nivel) => {
    if (nivel === 'Alto') return { pill: styles.pillAlto, dot: styles.dotAlto };
    if (nivel === 'Medio') return { pill: styles.pillMedio, dot: styles.dotMedio };
    return { pill: styles.pillBajo, dot: styles.dotBajo };
  };

  const columnasAlertas = [
    { clave: 'fecha', encabezado: 'Fecha / Hora' },
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
      }
    },
    { 
      clave: 'nivel',
      encabezado: 'Nivel de Riesgo',
      renderizar: (valor) => <ColorUrgencia valor={valor}/>
    },
    { clave: 'estado', encabezado: 'Estado' },
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
      ) 
    }
  ];

  const filtrosAlertas = [
    { clave: 'categoria', etiqueta: 'Categoría', opciones: ['RS', 'VD'] },
    { clave: 'nivel', etiqueta: 'Nivel', opciones: ['Alto', 'Medio', 'Bajo'] }
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const datosMock = await api.listarAlertas();
        setAlertas(datosMock);
      } catch (error) {
        console.error('Error al obtener el historial de alertas:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleGuardarEvaluacion = (alertaEditada, evaluacion) => {
    setAlertaSeleccionada(null);

    api.actualizarEvaluacion(alertaEditada.id, evaluacion).then(actualizada => setAlertas(prev => prev.map(a => a.id === actualizada.id ? actualizada : a)))

    setMostrarExito(true);
    setTimeout(() => setMostrarExito(false), 4000);
  };

  const headerFiltros = <div className={styles.titulo}>
    <h2>Filtros</h2>
    <p className={styles.subtitulo}>Consulta eventos por fecha, categoría o nivel del evento.</p>
  </div>
  const headerTabla = <div className={styles.titulo}>
    <h2>Registro de alertas</h2>
    <p className={styles.subtitulo}>Cada registro identifica cuándo ocurrió la alerta, nuemro de box y el nivel de riesgo.</p>
  </div>

  return (
    <div className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className={styles.header}>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-content-primary">
            Historial de Alertas
          </h1>
          <p className={`${styles.subtitulo} text-sm text-content-secondary mt-1`}>
            Visualiza el registro histórico de todas las alertas generadas por los boxes.
          </p>
        </div>
      </div>

      {mostrarExito && (
        <div className={styles.toastExito}>
          <div className={styles.toastIconContainer}>
            <svg className={styles.toastIcon} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastTitle}>Evaluación registrada correctamente</p>
            <p className={styles.toastMessage}>La alerta ha sido clasificada y archivada en el historial.</p>
          </div>
          <button onClick={() => setMostrarExito(false)} className={styles.toastCloseBtn}>
            <svg className={styles.toastIcon} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>
      )}

      <section className="bg-surface-card rounded-xl border border-gray-200/90 shadow-xs overflow-hidden p-5">
        {cargando ? (
          <p className="text-sm text-content-secondary text-center py-10">Cargando alertas...</p>
        ) : (
          <PaginaTabla 
            columnas={columnasAlertas} 
            datos={alertas} 
            filtros={filtrosAlertas}
            headerFiltros={headerFiltros}
            headerTabla={headerTabla}
          />
        )}
      </section>

      <ModalDetalle 
        alerta={alertaSeleccionada} 
        onCerrar={() => setAlertaSeleccionada(null)} 
        onGuardar={handleGuardarEvaluacion}
      />
    </div>
  );
};

export default HistorialAlertas;
