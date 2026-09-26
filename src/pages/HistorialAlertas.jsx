import { useState, useEffect } from 'react';
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla';
import { MockService } from '../services/MockService';

const HistorialAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const columnasAlertas = [
    { clave: 'fecha', encabezado: 'Fecha / Hora' },
    { clave: 'box', encabezado: 'Box' },
    { clave: 'nivel', encabezado: 'Nivel de Riesgo' },
    { clave: 'estado', encabezado: 'Estado' },
    { 
      clave: 'acciones', 
      encabezado: '', 
      renderizar: () => (
        <button 
          type="button" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-primary/25 bg-brand-primary/5 text-brand-primary text-[11px] font-semibold hover:bg-brand-primary/10 transition-all"
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
    </div>
  );
};

export default HistorialAlertas;