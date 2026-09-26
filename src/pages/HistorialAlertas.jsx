import { useState, useEffect } from 'react';
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla';
import { MockService } from '../services/MockService';
import ModalDetalle from '../components/ModalDetalle';
import styles from './HistorialAlertas.module.css';

const HistorialAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

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
      renderizar: (valor) => {
        const estilos = getEstilosSeveridad(valor);
        return (
          <span className={`${styles.pill} ${estilos.pill}`}>
            <span className={`${styles.dot} ${estilos.dot}`}></span>
            {valor}
          </span>
        );
      }
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

  return (
    <div className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-content-primary">
            Historial de Alertas
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Visualiza el registro histórico de todas las alertas generadas por los boxes.
          </p>
        </div>
      </div>

      <section className="bg-surface-card rounded-xl border border-gray-200/90 shadow-xs overflow-hidden p-5">
        {cargando ? (
          <p className="text-sm text-content-secondary text-center py-10">Cargando alertas...</p>
        ) : (
          <PaginaTabla 
            columnas={columnasAlertas} 
            datos={alertas} 
            filtros={filtrosAlertas}
          />
        )}
      </section>

      <ModalDetalle 
        alerta={alertaSeleccionada} 
        onCerrar={() => setAlertaSeleccionada(null)} 
      />
    </div>
  );
};

export default HistorialAlertas;