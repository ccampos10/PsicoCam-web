
import { useState, useMemo } from "react";
import { Fila } from "./Fila";
import styles from "./PaginaTabla.module.css";


export function PaginaTabla({
  datos,
  columnas,
  filtros = [],
  headerFiltros,
  headerTabla,
  itemsPorPagina = 10,
  mensajeVacio = "No hay registros para mostrar.",
  className = "",
  resumenPaginacion = false,
  alSeleccionarFila,
  onFiltrosChange,
}) {
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);

  const datosFiltrados = useMemo(() => {
    return datos.filter((item) =>
      filtros.every((filtro) => {
        const valor = valoresFiltro[filtro.clave] ?? "";

        if (valor === "") return true;

        const valorRegistro = item[filtro.clave];

        if (valorRegistro == null) return false;

        if (filtro.tipo === "texto") {
          return String(valorRegistro)
            .toLocaleLowerCase()
            .includes(valor.trim().toLocaleLowerCase());
        }

        if (filtro.tipo === "fecha") {
          return String(valorRegistro).slice(0, 10) === valor;
        }

        return String(valorRegistro) === String(valor);
      })
    );
  }, [datos, filtros, valoresFiltro]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(datosFiltrados.length / itemsPorPagina)
  );

  const paginaVisible = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaVisible - 1) * itemsPorPagina;

  const datosPagina = datosFiltrados.slice(
    inicio,
    inicio + itemsPorPagina
  );

  function handleFiltroChange(campo, valor) {
    const nuevosValores = {
      ...valoresFiltro,
      [campo]: valor,
    };

    setValoresFiltro(nuevosValores);
    setPaginaActual(1);

    onFiltrosChange?.(nuevosValores);
  }

  return (
    <div className={className}>
      {filtros.length > 0 && (
        <div className={styles.contenedor}>
          {headerFiltros}

          <div className={styles.filtros}>
            {filtros.map((filtro) => (
              <label
                key={filtro.clave}
                className={styles.filtro}
              >
                {filtro.etiqueta}

                {filtro.tipo === "texto" ? (
                  <input
                    type="text"
                    value={valoresFiltro[filtro.clave] ?? ""}
                    placeholder={filtro.placeholder ?? "Buscar..."}
                    onChange={(e) =>
                      handleFiltroChange(
                        filtro.clave,
                        e.target.value
                      )
                    }
                  />
                ) : filtro.tipo === "fecha" ? (
                  <input
                    type="date"
                    value={valoresFiltro[filtro.clave] ?? ""}
                    onChange={(e) =>
                      handleFiltroChange(
                        filtro.clave,
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <select
                    value={valoresFiltro[filtro.clave] ?? ""}
                    onChange={(e) =>
                      handleFiltroChange(
                        filtro.clave,
                        e.target.value
                      )
                    }
                  >
                    <option value="">Todos</option>

                    {(filtro.opciones ?? []).map((opcion) => (
                      <option
                        key={opcion}
                        value={opcion}
                      >
                        {opcion}
                      </option>
                    ))}
                  </select>
                )}
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
                {columnas.map((columna) => (
                  <th key={columna.clave}>
                    {columna.encabezado}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {datosPagina.length === 0 && (
                <tr>
                  <td colSpan={columnas.length}>
                    {mensajeVacio}
                  </td>
                </tr>
              )}

              {datosPagina.map((item, i) => (
                <Fila
                  key={item.id ?? i}
                  alSeleccionar={
                    alSeleccionarFila
                      ? () => alSeleccionarFila(item)
                      : undefined
                  }
                  celdas={columnas.map((columna) =>
                    columna.renderizar
                      ? columna.renderizar(
                          item[columna.clave],
                          item
                        )
                      : item[columna.clave]
                  )}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.paginacion}>
          {(!resumenPaginacion || totalPaginas > 1) && (
            <button
              disabled={paginaVisible === 1}
              onClick={() =>
                setPaginaActual(paginaVisible - 1)
              }
            >
              Anterior
            </button>
          )}

          <span>
            Página {paginaVisible} de {totalPaginas}
            {resumenPaginacion &&
              `  -  ${datosFiltrados.length} registros`}
          </span>

          {(!resumenPaginacion || totalPaginas > 1) && (
            <button
              disabled={paginaVisible === totalPaginas}
              onClick={() =>
                setPaginaActual(paginaVisible + 1)
              }
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
