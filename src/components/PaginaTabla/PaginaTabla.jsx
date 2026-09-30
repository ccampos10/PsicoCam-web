import { useState, useMemo } from "react";
import { Fila } from "./Fila";
import styles from "./PaginaTabla.module.css";

/**
 * @param {Object[]} datos
 * @param {{ clave: string, encabezado: string, renderizar?: (valor: any, item: Object) => React.ReactNode }[]} columnas
 * @param {{ clave: string, etiqueta: string, opciones: string[] }[]} [filtros]
 * @param {React.ReactNode} [headerFiltros]
 * @param {React.ReactNode} [headerTabla]
 * @param {number} [itemsPorPagina]
 */
export function PaginaTabla({ datos, columnas, filtros = [], headerFiltros, headerTabla, itemsPorPagina = 10, mensajeVacio = 'No hay registros para mostrar.', className = '', resumenPaginacion = false }) {
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);

  const datosFiltrados = useMemo(() => {
    return datos.filter((item) =>
      Object.entries(valoresFiltro).every(([campo, valor]) =>
        !valor ? true : item[campo] === valor
      )
    );
  }, [datos, valoresFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / itemsPorPagina));
  const paginaVisible = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaVisible - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  function handleFiltroChange(campo, valor) {
    setValoresFiltro((prev) => ({ ...prev, [campo]: valor }));
    setPaginaActual(1);
  }

  return (
    <div className={className}>
      {filtros.length > 0 && (
        <div className={styles.contenedor}>
          {headerFiltros}
          <div className={styles.filtros}>
            {filtros.map((f) => (
              <label key={f.clave} className={styles.filtro}>
                {f.etiqueta}
                <select
                  value={valoresFiltro[f.clave] ?? ""}
                  onChange={(e) => handleFiltroChange(f.clave, e.target.value)}
                >
                  <option value="">Todos</option>
                  {f.opciones.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className={styles.contenedor}>
        {headerTabla}
        <div className={styles.desplazamientoTabla}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col.clave}>{col.encabezado}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 && <tr><td colSpan={columnas.length}>{mensajeVacio}</td></tr>}
            {datosPagina.map((item, i) => (
              <Fila
                key={item.id ?? i}
                celdas={columnas.map((col) =>
                  col.renderizar ? col.renderizar(item[col.clave], item) : item[col.clave]
                )}
              />
            ))}
          </tbody>
        </table>
        </div>

        <div className={styles.paginacion}>
          {(!resumenPaginacion || totalPaginas > 1) && <button disabled={paginaVisible === 1} onClick={() => setPaginaActual(paginaVisible - 1)}>
            Anterior
          </button>}
          <span>Página {paginaVisible} de {totalPaginas}{resumenPaginacion && `  -  ${datosFiltrados.length} registros`}</span>
          {(!resumenPaginacion || totalPaginas > 1) && <button disabled={paginaVisible === totalPaginas} onClick={() => setPaginaActual(paginaVisible + 1)}>
            Siguiente
          </button>}
        </div>
      </div>
    </div>
  );
}
