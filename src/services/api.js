const API_BASE = import.meta.env.VITE_API_URL || ''
import { leerSesion, guardarSesion, borrarSesion } from './sesionStorage'
import { EVENTO_ALERTAS, EVENTO_EVALUACION } from './eventosAlertas'

export const EVENTO_SESION_EXPIRADA = 'psicocam:sesion-expirada'

function expirarSesion() {
  borrarSesion()
  window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA))
}

function objeto(valor) { return valor !== null && typeof valor === 'object' && !Array.isArray(valor) }
function validarObjeto(valor, nombre) {
  if (!objeto(valor)) throw new Error('El servidor devolvió '+nombre+' con un formato inesperado. Inténtalo nuevamente.')
  return valor
}
function validarLista(valor, nombre) {
  if (!Array.isArray(valor) || valor.some(item => !objeto(item) || !['string','number'].includes(typeof item.id))) throw new Error('El servidor devolvió la lista de '+nombre+' con un formato inesperado. Inténtalo nuevamente.')
  return valor
}

async function solicitar(ruta, opciones = {}) {
  const token = leerSesion()?.token
  const respuesta = await fetch(`${API_BASE}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  })

  const cuerpo = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    if (respuesta.status === 401 && ruta !== '/api/login') {
      expirarSesion()
      throw new Error('La sesión ha expirado. Inicia sesión nuevamente.')
    }
    throw new Error((typeof cuerpo?.error === 'string' && cuerpo.error) || cuerpo?.mensaje || 'No se pudo completar la solicitud.')
  }
  if (cuerpo === null) throw new Error('El servidor devolvió una respuesta inválida. Inténtalo nuevamente.')
  return cuerpo
}


function normalizarClasificacion(estadoEvaluacion) {
  const estado = String(estadoEvaluacion || '').trim().toLowerCase()
  if (estado === 'correcta') return 'correcta'
  if (estado === 'falso positivo') return 'falso positivo'
  throw new Error('La evaluación debe ser "correcta" o "falso positivo".')
}

function normalizarConfiguracion(datos) {
  return {
    horaInicio: datos?.horaOperacion?.hora_inicio || '08:00',
    horaTermino: datos?.horaOperacion?.hora_termino || '22:00',
    correoCliente: datos?.contactoRespaldo?.correo || '',
    modoCorreo: datos?.notificacionesCorreo?.modo || 'asignado',
    incluirAdministradores: datos?.notificacionesCorreo?.incluirAdministradores === true,
  }
}

function datosUsuario(datos) {
  const roles = { Administrador: 'administrador', Supervisor: 'supervisor' }
  if (datos.rol !== undefined && !Object.hasOwn(roles, datos.rol)) throw new Error('Selecciona un rol válido.')
  return {
    ...(datos.nombre !== undefined && { nombre: datos.nombre }),
    ...(datos.correo !== undefined && { correo: datos.correo }),
    ...(datos.contrasena && { password: datos.contrasena }),
    ...(datos.rol !== undefined && { rol: roles[datos.rol] }),
    ...(datos.estado !== undefined && { esta_activo: datos.estado === 'Activo' }),
  }
}

export const api = {
  async iniciarSesion(credenciales) {
    const datos = await solicitar('/api/login', {
      method: 'POST',
      body: JSON.stringify({ correo: credenciales.usuario, password: credenciales.contrasena }),
    })
    return guardarSesion(datos, credenciales.recordarme === true)
  },

  async cerrarSesion() {
    // El backend usa JWT sin ruta de revocación; cerrar sesión elimina el token local.
    borrarSesion()
  },

  sesionActual() { return leerSesion()?.usuario || null },

  obtenerCuenta: () => solicitar('/api/cuenta'),
  async actualizarCuenta(datos) {
    const sesion = await solicitar('/api/cuenta', { method: 'PATCH', body: JSON.stringify(datos) })
    return guardarSesion(sesion)
  },
  cambiarContrasena: datos => solicitar('/api/cuenta/contrasena', {
    method: 'PUT', body: JSON.stringify(datos),
  }),

  listarBitacora: async () => validarLista(await solicitar('/api/bitacora', { cache: 'no-store' }), 'eventos'),
  async listarAlertas() {
    const alertas = validarLista(await solicitar('/api/alertas', { cache: 'no-store' }), 'alertas')
    window.dispatchEvent(new CustomEvent(EVENTO_ALERTAS, { detail: alertas }))
    return alertas
  },
  obtenerAlerta: async id => validarObjeto(await solicitar(`/api/alertas/id?${new URLSearchParams({ id: String(id) })}`, { cache: 'no-store' }), 'una alerta'),
  obtenerTranscripcion: id => solicitar(`/api/alertas/transcripcion?${new URLSearchParams({ id: String(id) })}`, { cache: 'no-store' }),
  async actualizarEvaluacion(id, estadoEvaluacion, notasClinicas) {
    const actualizada = validarObjeto(await solicitar('/api/alertas/'+encodeURIComponent(id)+'/evaluacion', {
      method: 'PATCH', body: JSON.stringify({ clasificacion: normalizarClasificacion(estadoEvaluacion), ...(notasClinicas !== undefined && { notasClinicas }) }),
    }), 'la evaluación')
    window.dispatchEvent(new CustomEvent(EVENTO_EVALUACION, { detail: actualizada }))
    return actualizada
  },
  obtenerAuditoriaAlerta: async id => validarLista(await solicitar('/api/alertas/bitacora?'+new URLSearchParams({ id: String(id) }), { cache: 'no-store' }), 'eventos de auditoría'),
  obtenerConfiguracion: async () => normalizarConfiguracion(validarObjeto(await solicitar('/api/configuracion'), 'la configuración')),
  actualizarConfiguracion: async (datos) => normalizarConfiguracion(await solicitar('/api/configuracion', {
    method: 'PUT',
    body: JSON.stringify({
      horaOperacion: {
        hora_inicio: datos.horaInicio,
        hora_termino: datos.horaTermino,
      },
      ...(datos.correoCliente ? { contactoRespaldo: { correo: datos.correoCliente } } : {}),
      notificacionesCorreo: { modo: datos.modoCorreo, incluirAdministradores: datos.incluirAdministradores },
    }),
  })),
  listarUsuarios: async () => validarLista(await solicitar('/api/usuarios'), 'usuarios'),
  crearUsuario: datos => solicitar('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(datosUsuario(datos)),
  }),
  actualizarUsuario: (id, datos) => solicitar(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: 'PATCH', body: JSON.stringify(datosUsuario(datos)),
  }),
  eliminarUsuario: id => solicitar(`/api/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
