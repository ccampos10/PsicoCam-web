/**
 * @typedef {Object} Usuario
 * @property {number} id - Identificador unico del usuario
 * @property {string} correo - Correo institucional usado para iniciar sesion
 * @property {string} rol - Rol del usuario dentro del sistema
 */

export class Usuario {
  constructor({ id, correo, rol, nombre = '', estado = 'Activo', ultimoAcceso = null }) {
    this.id = id;
    this.correo = correo;
    this.rol = rol;
    this.nombre = nombre;
    this.estado = estado;
    this.ultimoAcceso = ultimoAcceso;
  }
}
