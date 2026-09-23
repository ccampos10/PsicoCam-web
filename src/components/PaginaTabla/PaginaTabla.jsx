import { useState, useMemo } from "react";
import { Fila } from "./Fila";
import styles from "./PaginaTabla.module.css";

/**
 * @param {Object[]} datos
 * @param {{ clave: string, encabezado: string, renderizar?: (valor: any, item: Object) => React.ReactNode }[]} columnas
 * @param {{ clave: string, etiqueta: string, opciones: string[] }[]} [filtros]
 * @param {number} [itemsPorPagina]
 */
export function PaginaTabla({ datos, columnas, filtros = [], itemsPorPagina = 10 }) {
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
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const datosPagina = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  function handleFiltroChange(campo, valor) {
    setValoresFiltro((prev) => ({ ...prev, [campo]: valor }));
    setPaginaActual(1);
  }

  return (
    <div className={styles.contenedor}>
      {filtros.length > 0 && (
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
      )}

      <table className={styles.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.clave}>{col.encabezado}</th>
            ))}
          </tr>
        </thead>
        <tbody>
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

      <div className={styles.paginacion}>
        <button disabled={paginaActual === 1} onClick={() => setPaginaActual((p) => p - 1)}>
          Anterior
        </button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}