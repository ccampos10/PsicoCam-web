const API_BASE = import.meta.env.VITE_API_URL || ''
let token = sessionStorage.getItem('psicocam_token') || ''

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opciones.headers } })
  if (!respuesta.ok) throw new Error((await respuesta.json().catch(() => ({}))).error || 'No se pudo completar la solicitud.')
  return respuesta.status === 204 ? null : respuesta.json()
}

export const api = {
  async iniciarSesion(credenciales) { const datos = await solicitar('/api/sesion', { method: 'POST', body: JSON.stringify(credenciales) }); token = datos.token; sessionStorage.setItem('psicocam_token', token); return datos.usuario },
  async cerrarSesion() { await solicitar('/api/sesion', { method: 'DELETE' }); token = ''; sessionStorage.removeItem('psicocam_token') },
  async sesionActual() { return (await solicitar('/api/sesion')).usuario },
  listarBitacora: () => solicitar('/api/bitacora'),
  listarAlertas: filtros => solicitar(`/api/alertas?${new URLSearchParams(filtros)}`),
  actualizarEvaluacion: (id, estadoEvaluacion) => solicitar(`/api/alertas/${id}/evaluacion`, { method: 'PUT', body: JSON.stringify({ estadoEvaluacion }) }),
  obtenerConfiguracion: () => solicitar('/api/configuracion'),
  actualizarConfiguracion: datos => solicitar('/api/configuracion', { method: 'PUT', body: JSON.stringify(datos) }),
}
