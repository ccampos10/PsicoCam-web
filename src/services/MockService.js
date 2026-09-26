import mockData from "./mockData.json";

const LATENCIA_MS = 400;

function simularLatencia(valor) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(valor), LATENCIA_MS);
  });
}

let configuracionActual = {
  horaInicio: "08:00",
  horaTermino: "22:00",
  correoCliente: "atencion.cliente@universidad.cl",
};

export const MockService = {
  /**
   * Devuelve la lista de alertas, opcionalmente filtrada.
   * @param {{ box?: string, categoria?: string, nivel?: string, fecha?: string }} filtros
   */
  async listarAlertas(filtros = {}) {
    let resultado = mockData;

    if (filtros.box) {
      resultado = resultado.filter((a) => a.box === filtros.box);
    }
    if (filtros.categoria) {
      resultado = resultado.filter((a) => a.categoria === filtros.categoria);
    }
    if (filtros.nivel) {
      resultado = resultado.filter((a) => a.nivel === filtros.nivel);
    }
    if (filtros.fecha) {
      resultado = resultado.filter((a) => a.fecha === filtros.fecha);
    }

    return simularLatencia(resultado);
  },

  /**
   * Devuelve una alerta por su id, o null si no existe.
   * @param {number} id
   */
  async obtenerAlertaPorId(id) {
    const encontrada = mockData.find((a) => a.id === id) ?? null;
    return simularLatencia(encontrada);
  },

  /**
   * Devuelve conteos totales por nivel de urgencia
   */
  async contarPorNivel() {
    const conteo = { Alto: 0, Medio: 0, Bajo: 0 };
    mockData.forEach((a) => {
      conteo[a.nivel] = (conteo[a.nivel] ?? 0) + 1;
    });
    return simularLatencia(conteo);
  },

  async obtenerConfiguracion() {
    return simularLatencia({ ...configuracionActual });
  },

  async actualizarConfiguracion(nuevaConfiguracion) {
    configuracionActual = { ...configuracionActual, ...nuevaConfiguracion };
    return simularLatencia({ ...configuracionActual });
  },
};