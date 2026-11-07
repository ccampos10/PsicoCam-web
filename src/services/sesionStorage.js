const TOKEN = 'psicocam_token'
const USUARIO = 'psicocam_usuario'
export function leerSesion() {
  for (const tipo of ['sessionStorage', 'localStorage']) {
    try {
      const token = window[tipo].getItem(TOKEN)
      const usuario = JSON.parse(window[tipo].getItem(USUARIO) || 'null')
      if (token && usuario && typeof usuario.nombre === 'string' && typeof usuario.rol === 'string') return { token, usuario, tipo }
    } catch { /* Un almacenamiento bloqueado o corrupto no impide abrir el login. */ }
  }
  return null
}
export function borrarSesion() {
  for (const tipo of ['sessionStorage', 'localStorage']) {
    try { window[tipo].removeItem(TOKEN); window[tipo].removeItem(USUARIO) } catch { /* Almacenamiento bloqueado. */ }
  }
}
export function guardarSesion(datos, recordar = leerSesion()?.tipo === 'localStorage') {
  if (!datos || typeof datos.token !== 'string' || !datos.token || !datos.usuario || typeof datos.usuario.nombre !== 'string' || typeof datos.usuario.rol !== 'string') throw new Error('No se recibió una sesión válida del servidor.')
  const almacenamiento = recordar ? localStorage : sessionStorage
  borrarSesion()
  almacenamiento.setItem(TOKEN, datos.token)
  almacenamiento.setItem(USUARIO, JSON.stringify(datos.usuario))
  return datos.usuario
}
