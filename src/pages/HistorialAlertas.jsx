import { useState, useEffect } from 'react';
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla';
import { MockService } from '../services/MockService';
import ModalDetalle from '../components/ModalDetalle';
import styles from './HistorialAlertas.module.css';
import { ColorUrgencia } from '../components/Pilas';

const HistorialAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [mostrarExito, setMostrarExito] = useState(false);

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
      },
    },
    {
      clave: 'nivel',
      encabezado: 'Nivel de Riesgo',
      renderizar: (valor) => <ColorUrgencia valor={valor} />,
    },
    { clave: 'estado_evaluacion', encabezado: 'Estado' },
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

  const filtrosAlertas = [
    { clave: 'categoria', etiqueta: 'Categoría', opciones: ['RS', 'VD'] },
    { clave: 'nivel', etiqueta: 'Nivel', opciones: ['Alto', 'Medio', 'Bajo'] },
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

  const handleGuardarEvaluacion = (alertaEditada, evaluacion) => {
    setAlertaSeleccionada(null);

    setAlertas((prevAlertas) =>
      prevAlertas.map((a) =>
        a.id === alertaEditada.id ? { ...a, estado_evaluacion: evaluacion } : a
      )
    );

    setMostrarExito(true);
    setTimeout(() => setMostrarExito(false), 4000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Historial de Alertas</h1>
          <p className={styles.subtitle}>
            Visualiza el registro histórico de todas las alertas generadas por los boxes.
          </p>
        </div>
      </header>

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastTitle}>Evaluación registrada correctamente</p>
            <p className={styles.toastMessage}>
              La alerta ha sido clasificada y archivada en el historial.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarExito(false)}
            className={styles.toastCloseBtn}
          >
            <svg
              className={styles.toastIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>
      )}

      <section className={styles.cardSection}>
        {cargando ? (
          <p className={styles.loadingText}>Cargando alertas...</p>
        ) : (
          <PaginaTabla
            columnas={columnasAlertas}
            datos={alertas}
            filtros={filtrosAlertas}
          />
        )}
      </section>

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