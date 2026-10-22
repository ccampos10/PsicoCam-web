
import { useState, useMemo, useEffect } from "react";
import { Fila } from "./Fila";
import styles from "./PaginaTabla.module.css";

// Normaliza fechas a yyyy-mm-dd.
function normalizarFecha(valor) {
  if (!valor) return "";

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return "";

    const anio = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, "0");
    const dia = String(valor.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  }

  const texto = String(valor).trim();

  // Formato ISO: yyyy-mm-dd, con hora opcional.
  const fechaISO = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/
  );

  if (fechaISO) {
    return `${fechaISO[1]}-${fechaISO[2]}-${fechaISO[3]}`;
  }

  // Formato local: dd/mm/yyyy o dd-mm-yyyy, con hora opcional.
  const fechaLocal = texto.match(
    /^(\d{2})[/-](\d{2})[/-](\d{4})(?:$|[T\s])/
  );

  if (fechaLocal) {
    return `${fechaLocal[3]}-${fechaLocal[2]}-${fechaLocal[1]}`;
  }

  return "";
}

// Convierte yyyy-mm-dd a dd-mm-yyyy.
function formatearFecha(fechaISO) {
  if (!fechaISO) return "";

  const coincidencia = String(fechaISO).match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!coincidencia) return "";

  return `${coincidencia[3]}-${coincidencia[2]}-${coincidencia[1]}`;
}

export function PaginaTabla({
  datos,
  columnas,
  filtros = [],
  headerFiltros,
  pieFiltros,
  headerTabla,
  itemsPorPagina = 10,
  mensajeVacio = "No hay registros para mostrar.",
  className = "",
  classNameFiltros = "",
  resumenPaginacion = false,
  alSeleccionarFila,
  onFiltrosChange,
  onResultadosChange,
}) {
  // Estados administrados por PaginaTabla.
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrado centralizado.
  const datosFiltrados = useMemo(() => {
    return datos.filter((item) =>
      filtros.every((filtro) => {
        const valor = valoresFiltro[filtro.clave] ?? "";

        if (valor === "") return true;

        const campoDatos = filtro.campo ?? filtro.clave;
        const valorRegistro = item[campoDatos];

        // Búsqueda de texto en uno o varios campos.
        if (filtro.tipo === "texto") {
          const campos = filtro.campos ?? [campoDatos];
          const textoBuscado = String(valor)
            .trim()
            .toLocaleLowerCase();

          return campos.some((campo) =>
            String(item[campo] ?? "")
              .toLocaleLowerCase()
              .includes(textoBuscado)
          );
        }

        if (valorRegistro == null) return false;

        // Comparación de fechas normalizadas.
        if (filtro.tipo === "fecha") {
          return normalizarFecha(valorRegistro) === valor;
        }

        
        if (filtro.ignorarMayusculas) {
  return (
    String(valorRegistro).trim().toLocaleLowerCase() ===
    String(valor).trim().toLocaleLowerCase()
  );
}

return String(valorRegistro) === String(valor);
      })
    );
  }, [datos, filtros, valoresFiltro]);

  // Notifica cuántos registros cumplen los filtros.
  useEffect(() => {
    onResultadosChange?.(datosFiltrados.length);
  }, [datosFiltrados.length, onResultadosChange]);

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

  // Actualiza filtros y notifica sus valores.
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
      {/* Panel de filtros */}
      {filtros.length > 0 && (
        <div className={styles.contenedor}>
          {headerFiltros}

          <div className={`${styles.filtros} ${classNameFiltros}`}>
            {filtros.map((filtro) => {
              const valor = valoresFiltro[filtro.clave] ?? "";

              return (
                <div
                  key={filtro.clave}
                  className={styles.filtro}
                >
                  <label htmlFor={`filtro-${filtro.clave}`}>
                    {filtro.etiqueta}
                  </label>

                  {/* Filtro de texto */}
                  {filtro.tipo === "texto" ? (
                    <input
                      id={`filtro-${filtro.clave}`}
                      type="text"
                      value={valor}
                      placeholder={
                        filtro.placeholder ?? "Buscar..."
                      }
                      onChange={(e) =>
                        handleFiltroChange(
                          filtro.clave,
                          e.target.value
                        )
                      }
                    />

                  /* Filtro de fecha */
                  ) : filtro.tipo === "fecha" ? (
                    <div className={styles.contenedorFecha}>
                      <input
                        type="text"
                        placeholder="dd-mm-aaaa"
                        value={formatearFecha(valor)}
                        readOnly
                        className={styles.entradaFecha}
                        aria-label={`${filtro.etiqueta} seleccionada`}
                      />

                      {valor && (
                        <button
                          type="button"
                          className={styles.limpiarFecha}
                          onClick={() =>
                            handleFiltroChange(filtro.clave, "")
                          }
                          aria-label={`Limpiar ${filtro.etiqueta}`}
                          title="Limpiar fecha"
                        >
                          ×
                        </button>
                      )}

                      <input
                        id={`filtro-${filtro.clave}`}
                        type="date"
                        lang="es-CL"
                        value={valor}
                        onChange={(e) =>
                          handleFiltroChange(
                            filtro.clave,
                            e.target.value
                          )
                        }
                        className={styles.selectorCalendario}
                      />
                    </div>

                  /* Filtro de selección */
                  ) : (
                    <select
                      id={`filtro-${filtro.clave}`}
                      value={valor}
                      onChange={(e) =>
                        handleFiltroChange(
                          filtro.clave,
                          e.target.value
                        )
                      }
                    >
                      <option value="">Todos</option>

                      {(filtro.opciones ?? []).map((opcion) => {
                        const valorOpcion =
                          typeof opcion === "object"
                            ? opcion.valor
                            : opcion;

                        const etiquetaOpcion =
                          typeof opcion === "object"
                            ? opcion.etiqueta
                            : opcion;

                        return (
                          <option
                            key={valorOpcion}
                            value={valorOpcion}
                          >
                            {etiquetaOpcion}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
          {pieFiltros}
        </div>
      )}

      {/* Tabla de registros */}
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

        {/* Paginación */}
        <div className={styles.paginacion}>
          {(!resumenPaginacion || totalPaginas > 1) && (
            <button
              type="button"
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
              ` - ${datosFiltrados.length} registros`}
          </span>

          {(!resumenPaginacion || totalPaginas > 1) && (
            <button
              type="button"
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
