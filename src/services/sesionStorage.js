const CLAVES_LEGADAS = ['psicocam_token', 'psicocam_usuario']
export const EVENTO_CAMBIO_SESION = 'psicocam_session_event'

export function borrarSesion() {
  for (const tipo of ['sessionStorage', 'localStorage']) {
    try {
      for (const clave of CLAVES_LEGADAS) window[tipo].removeItem(clave)
    } catch { /* Un almacenamiento bloqueado no impide cerrar la sesion. */ }
  }
}

export function guardarSesion(datos) {
  const usuario = datos?.usuario
  if (!usuario || typeof usuario.nombre !== 'string' || typeof usuario.rol !== 'string') {
    throw new Error('No se recibio una sesion valida del servidor.')
  }
  // La sesion real vive en la cookie HttpOnly.
  borrarSesion()
  notificarCambioSesion()
  return usuario
}

export function notificarCambioSesion() {
  try { localStorage.setItem(EVENTO_CAMBIO_SESION, String(Date.now())) } catch { /* Almacenamiento bloqueado. */ }
}
