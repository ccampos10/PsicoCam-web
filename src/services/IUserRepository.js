export default class IUserRepository {
  async buscarPorCorreo() {
    throw new Error('La búsqueda de usuarios por correo todavía no está implementada.')
  }

  async buscarPorId() {
    throw new Error('La búsqueda de usuarios por ID todavía no está implementada.')
  }

  async obtenerTodos() {
    throw new Error('La lista de usuarios todavía no está implementada.')
  }

  async verificarCredenciales() {
    throw new Error('La verificación de credenciales todavía no está implementada.')
  }

  async cerrarSesion() {
    throw new Error('El cierre de sesión en el backend todavía no está implementado.')
  }
}
