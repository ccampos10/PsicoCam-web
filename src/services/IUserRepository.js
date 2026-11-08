export default class IUserRepository {
  // Busca por correo (texto); devuelve el usuario o null si no existe.
  async buscarPorCorreo() {
    throw new Error('La búsqueda de usuarios por correo todavía no está implementada.')
  }

  // Busca por ID (texto o número); devuelve el usuario o null si no existe.
  async buscarPorId() {
    throw new Error('La búsqueda de usuarios por ID todavía no está implementada.')
  }

  // Obtiene todos los usuarios; devuelve una lista vacía si no hay ninguno.
  async obtenerTodos() {
    throw new Error('La lista de usuarios todavía no está implementada.')
  }

  // Recibe usuario, contrasena y recordarme; inicia sesión y devuelve el perfil o null si las credenciales son inválidas.
  async verificarCredenciales() {
    throw new Error('La verificación de credenciales todavía no está implementada.')
  }

  // Cierra la sesión en el backend; termina sin devolver datos o lanza un error si falla.
  async cerrarSesion() {
    throw new Error('El cierre de sesión en el backend todavía no está implementado.')
  }
}
