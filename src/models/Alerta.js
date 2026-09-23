/**
 * @typedef {"RS" | "VD"} CategoriaAlerta - Riesgo Suicida (RS) o Vulneracion de Derechos (VD)
 * @typedef {"Alto" | "Medio" | "Bajo"} NivelAlerta - Nivel de urgencia representado como semaforo
 * @typedef {"correcta" | "falso positivo" | "neutro"} EstadoEvaluacion - Resultado de la evaluacion de la alerta por el supervisor
 * @typedef {Object} Alerta
 * 
 * @property {number} id - Identificador unico de la alerta
 * @property {string} box - Box clinico donde se genero la alerta
 * @property {string} fecha - Fecha de deteccion, formato "YYYY-MM-DD"
 * @property {string} hora - Hora de deteccion, formato "HH:mm"
 * @property {CategoriaAlerta} categoria - Tipo de riesgo detectado
 * @property {NivelAlerta} nivel - Nivel de urgencia
 * @property {string} supervisor - Correo del supervisor asignado
 * @property {EstadoEvaluacion} estado_evaluacion - Evaluacion registrada por el supervisor
 */

export class Alerta {
  constructor({ id, box, fecha, hora, categoria, nivel, supervisor, estado_evaluacion }) {
    this.id = id;
    this.box = box;
    this.fecha = fecha;
    this.hora = hora;
    this.categoria = categoria;
    this.nivel = nivel;
    this.supervisor = supervisor;
    this.estado_evaluacion = estado_evaluacion;
  }
}