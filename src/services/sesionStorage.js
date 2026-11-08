const USUARIO = 'psicocam_usuario'
const TOKEN_LEGADO = 'psicocam_token'

// El perfil no es una credencial: el token vive únicamente en una cookie HttpOnly.
export function leerSesion() {
  for (const tipo of ['sessionStorage', 'localStorage']) {
    try {
      const usuario = JSON.parse(window[tipo].getItem(USUARIO) || 'null')
      if (usuario && typeof usuario.nombre === 'string' && typeof usuario.rol === 'string') return { usuario, tipo }
    } catch { /* Un almacenamiento bloqueado o corrupto no impide abrir el login. */ }
  }
  return null
}

export function borrarSesion() {
  for (const tipo of ['sessionStorage', 'localStorage']) {
    try {
      window[tipo].removeItem(TOKEN_LEGADO)
      window[tipo].removeItem(USUARIO)
    } catch { /* Almacenamiento bloqueado. */ }
  }
}

export function guardarSesion(datos, recordar = leerSesion()?.tipo === 'localStorage') {
  const usuario = datos?.usuario
  if (!usuario || typeof usuario.nombre !== 'string' || typeof usuario.rol !== 'string') throw new Error('No se recibió una sesión válida del servidor.')
  const almacenamiento = recordar ? localStorage : sessionStorage
  borrarSesion()
  almacenamiento.setItem(USUARIO, JSON.stringify(usuario))
  return usuario
}
