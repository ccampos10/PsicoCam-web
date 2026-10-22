const API_BASE = import.meta.env.VITE_API_URL || ''
const CLAVE_TOKEN = 'psicocam_token'
const CLAVE_USUARIO = 'psicocam_usuario'

let token = sessionStorage.getItem(CLAVE_TOKEN) || ''

async function solicitar(ruta, opciones = {}) {
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
      throw new Error('La sesión no es válida o ha expirado. Cierra sesión e inicia sesión para consultar los datos.')
    }
    throw new Error(cuerpo?.error || 'No se pudo completar la solicitud.')
  }
  return cuerpo
}

function guardarSesion(datos) {
  token = datos.token
  sessionStorage.setItem(CLAVE_TOKEN, token)
  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(datos.usuario))
  return datos.usuario
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
  }
}

export const api = {
  async iniciarSesion(credenciales) {
    const datos = await solicitar('/api/login', {
      method: 'POST',
      body: JSON.stringify({ correo: credenciales.usuario, password: credenciales.contrasena }),
    })
    return guardarSesion(datos)
  },

  async cerrarSesion() {
    // El backend usa JWT sin ruta de revocación; cerrar sesión elimina el token local.
    token = ''
    sessionStorage.removeItem(CLAVE_TOKEN)
    sessionStorage.removeItem(CLAVE_USUARIO)
  },

  sesionActual() {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_USUARIO) || 'null')
    } catch {
      return null
    }
  },

  obtenerCuenta: () => solicitar('/api/cuenta'),
  async actualizarCuenta(datos) {
    const sesion = await solicitar('/api/cuenta', { method: 'PATCH', body: JSON.stringify(datos) })
    return guardarSesion(sesion)
  },
  cambiarContrasena: datos => solicitar('/api/cuenta/contrasena', {
    method: 'PUT', body: JSON.stringify(datos),
  }),

  listarBitacora: () => solicitar('/api/bitacora'),
  listarAlertas: () => solicitar('/api/alertas'),
  obtenerAlerta: id => solicitar(`/api/alertas/id?${new URLSearchParams({ id: String(id) })}`),
  obtenerTranscripcion: id => solicitar(`/api/alertas/transcripcion?${new URLSearchParams({ id: String(id) })}`, { cache: 'no-store' }),
  actualizarEvaluacion: (id, estadoEvaluacion) => solicitar(
    `/api/alertas/clasificar?${new URLSearchParams({
      id: String(id),
      clasificacion: normalizarClasificacion(estadoEvaluacion),
    })}`,
  ),
  obtenerConfiguracion: async () => normalizarConfiguracion(await solicitar('/api/configuracion')),
  actualizarConfiguracion: async (datos) => normalizarConfiguracion(await solicitar('/api/configuracion', {
    method: 'PUT',
    body: JSON.stringify({
      horaOperacion: {
        hora_inicio: datos.horaInicio,
        hora_termino: datos.horaTermino,
      },
      contactoRespaldo: { correo: datos.correoCliente },
    }),
  })),
  listarUsuarios: () => solicitar('/api/usuarios'),
  crearUsuario: datos => solicitar('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      nombre: datos.nombre,
      correo: datos.correo,
      password: datos.contrasena,
      rol: datos.rol?.toLowerCase(),
      esta_activo: datos.estado === 'Activo',
    }),
  }),
}
