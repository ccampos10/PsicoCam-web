export default class IUserRepository {

  // Busca por correo electrónico (texto). Pendiente de implementar en el backend.
  // eslint-disable-next-line no-unused-vars - se usará cuando se implemente la consulta en el backend.
  async buscarPorCorreo(correo) {
    throw new Error('La búsqueda de usuarios por correo todavía no está implementada.')
  }

  // Busca por identificador (texto o número). Pendiente de implementar en el backend.
  // eslint-disable-next-line no-unused-vars - se usará cuando se implemente la consulta en el backend.
  async buscarPorId(id) {
    throw new Error('La búsqueda de usuarios por ID todavía no está implementada.')
  }
}
