import IUserRepository from '../services/IUserRepository'
import { api } from '../services/api'

function adaptarUsuario(usuario) {
  return {
    ...usuario,
    rol: usuario.rol === 'administrador' ? 'Administrador' : usuario.rol === 'supervisor' ? 'Supervisor' : usuario.rol,
    estado: usuario.esta_activo ? 'Activo' : 'Inactivo',
    ultimoAcceso: usuario.ultimo_acceso || null,
  }
}

export class ApiUsuarioRepository extends IUserRepository {
  soportaGestionCompleta = true

  async buscarPorCorreo(correo) {
    return (await this.obtenerTodos()).find((usuario) => usuario.correo === correo) || null
  }

  async buscarPorId(id) {
    return (await this.obtenerTodos()).find((usuario) => String(usuario.id) === String(id)) || null
  }

  async obtenerTodos() {
    return (await api.listarUsuarios()).map(adaptarUsuario)
  }

  async crearUsuario(datos) {
    return adaptarUsuario(await api.crearUsuario(datos))
  }

  async actualizarUsuario(id, datos) {
    return adaptarUsuario(await api.actualizarUsuario(id, datos))
  }

  async cambiarEstadoUsuario(id, estado) {
    return adaptarUsuario(await api.actualizarUsuario(id, { estado }))
  }

  async eliminarUsuario(id) {
    return api.eliminarUsuario(id)
  }

  verificarCredenciales(credenciales) {
    return api.iniciarSesion(credenciales)
  }

  cerrarSesion() {
    return api.cerrarSesion()
  }

  async listarUsuarios() {
    return this.obtenerTodos()
  }
}
