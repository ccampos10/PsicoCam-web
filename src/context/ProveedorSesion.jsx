import { useEffect, useState } from 'react'
import { ContextoSesion } from './ContextoSesion'
import { ProveedorAccesibilidad } from './Accesibilidad'
import { ProveedorNotificaciones } from './Notificaciones'
import { rutasInternas } from '../routes/mapaRutas'
import { api, EVENTO_SESION_EXPIRADA } from '../services/api'

// Vista previa de la interfaz; no autentica las peticiones a la API.
const usuarioVistaPrevia = {
  nombre: 'Usuario', rol: 'Supervisor',
  rutasPermitidas: rutasInternas.map(({ ruta }) => ruta),
}

function asignarRutasPermitidas(usuario) {
  if (!usuario) return null
  if (Array.isArray(usuario.rutasPermitidas)) return usuario

  const esAdministrador = String(usuario.rol || '').toLowerCase() === 'administrador'
  const rutasPermitidas = rutasInternas
    .filter(({ ruta }) => esAdministrador || ruta !== '/usuarios')
    .map(({ ruta }) => ruta)
  return { ...usuario, rutasPermitidas }
}

export function ProveedorSesion({ children, usuarioInicial = null, alCerrarSesion }) {
  const [usuario, establecerUsuario] = useState(() => asignarRutasPermitidas(usuarioInicial ?? api.sesionActual()))
  const [sesionExpirada, establecerSesionExpirada] = useState(false)
  const [errorCierreSesion, establecerErrorCierreSesion] = useState('')
  const [cerrandoSesion, establecerCerrandoSesion] = useState(false)
  useEffect(() => {
    const sincronizar = evento => {
      if (evento.key === null || evento.key === 'psicocam_token' || evento.key === 'psicocam_usuario') establecerUsuario(asignarRutasPermitidas(api.sesionActual()))
    }
    const expirar = () => {
      establecerUsuario(null)
      establecerSesionExpirada(true)
    }
    window.addEventListener('storage', sincronizar)
    window.addEventListener(EVENTO_SESION_EXPIRADA, expirar)
    return () => {
      window.removeEventListener('storage', sincronizar)
      window.removeEventListener(EVENTO_SESION_EXPIRADA, expirar)
    }
  }, [])

  async function iniciarSesion(credenciales) {
    const perfil = asignarRutasPermitidas(await api.iniciarSesion(credenciales))
    establecerUsuario(perfil)
    establecerSesionExpirada(false)
    return perfil
  }
  async function cerrarSesion() {
    establecerCerrandoSesion(true)
    establecerErrorCierreSesion('')
    try {
      await api.cerrarSesion()
      await alCerrarSesion?.()
      establecerUsuario(null)
      establecerSesionExpirada(false)
      return true
    } catch {
      establecerErrorCierreSesion('No se pudo cerrar la sesión. Inténtalo nuevamente.')
      return false
    } finally { establecerCerrandoSesion(false) }
  }
  const valor = {
    usuario, iniciarSesion, cerrarSesion, cerrandoSesion, errorCierreSesion, sesionExpirada,
    actualizarPerfil: async datos => {
      const perfil = asignarRutasPermitidas(await api.actualizarCuenta(datos))
      establecerUsuario(perfil)
      return perfil
    },
    vistaPreviaDisponible: import.meta.env.DEV,
    iniciarVistaPrevia: () => {
      if (import.meta.env.DEV) {
        establecerSesionExpirada(false)
        establecerUsuario(usuarioVistaPrevia)
      }
    },
  }
  return <ContextoSesion.Provider value={valor}><ProveedorAccesibilidad key={usuario?.id ?? usuario?.correo ?? 'sin-sesion'} usuario={usuario}><ProveedorNotificaciones key={usuario?.id ?? usuario?.correo ?? 'sin-sesion'} usuario={usuario}>{children}</ProveedorNotificaciones></ProveedorAccesibilidad></ContextoSesion.Provider>
}
