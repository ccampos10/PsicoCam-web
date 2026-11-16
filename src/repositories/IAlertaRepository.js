/**
 * Contrato asincrono para persistencia de alertas.
 *
 * @typedef {import("../models/Alerta.js").CategoriaAlerta} CategoriaAlerta
 * @typedef {import("../models/Alerta.js").NivelAlerta} NivelAlerta
 * @typedef {import("../models/Alerta.js").EstadoEvaluacion} EstadoEvaluacion
 * @typedef {import("../models/Alerta.js").Alerta} Alerta
 *
 * @interface
 */
export class IAlertaRepository {
  /**
   * Devuelve la lista de alertas, opcionalmente filtrada.
   *
   * @param {object} [filtros] - Criterios de filtrado opcionales.
   * @param {string} [filtros.box] - Box clinico.
   * @param {CategoriaAlerta} [filtros.categoria] - Tipo de riesgo detectado.
   * @param {NivelAlerta} [filtros.nivel] - Nivel de urgencia.
   * @param {string} [filtros.fecha] - Fecha de deteccion (formato "YYYY-MM-DD").
   * @returns {Promise<Alerta[]>} Lista de alertas que cumplen los criterios.
   */
  async getAll(filtros = {}) {
    throw new Error(`IAlertaRepository.getAll no implementado (filtros: ${JSON.stringify(filtros)})`);
  }

  /**
   * Devuelve una alerta por su identificador, o null si no existe.
   *
   * @param {number} id - Identificador unico de la alerta.
   * @returns {Promise<Alerta|null>} La alerta encontrada o null.
   */
  async getById(id) {
    throw new Error(`IAlertaRepository.getById no implementado (id: ${id})`);
  }

  /**
   * Almacena (inserta) una alerta y devuelve la alerta persistida.
   *
   * @param {Alerta} alerta - Datos de la alerta a almacenar.
   * @returns {Promise<Alerta>} La alerta almacenada.
   */
  async save(alerta) {
    throw new Error(`IAlertaRepository.save no implementado (id: ${alerta?.id})`);
  }

  /**
   * Actualiza el estado de evaluacion de una alerta.
   *
   * @param {number} id - Identificador unico de la alerta.
   * @param {EstadoEvaluacion} estadoEvaluacion - Nuevo estado de evaluacion ("correcta" | "falso positivo" | "neutro").
   * @returns {Promise<Alerta|null>} La alerta actualizada o null si no existe.
   */
  async actualizarEstadoEvaluacion(id, estadoEvaluacion) {
    throw new Error(`IAlertaRepository.actualizarEstadoEvaluacion no implementado (id: ${id}, estadoEvaluacion: ${estadoEvaluacion})`);
  }
}
