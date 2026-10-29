import { useEffect, useState } from 'react'
import { ContextoSesion } from './ContextoSesion'
import { ProveedorAccesibilidad } from './Accesibilidad'
import { ProveedorNotificaciones } from './Notificaciones'
import { rutasInternas } from '../routes/mapaRutas'
import { api } from '../services/api'

// Perfil de prueba para la vista previa, TODAVIA NO HAY BD
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
  const [usuario, establecerUsuario] = useState(usuarioInicial)
  const [errorCierreSesion, establecerErrorCierreSesion] = useState('')
  const [cerrandoSesion, establecerCerrandoSesion] = useState(false)
  useEffect(() => {
    if (usuarioInicial === null) establecerUsuario(asignarRutasPermitidas(api.sesionActual()))
  }, [usuarioInicial])

  async function iniciarSesion(credenciales) {
    const perfil = asignarRutasPermitidas(await api.iniciarSesion(credenciales))
    establecerUsuario(perfil)
    return perfil
  }
  async function cerrarSesion() {
    establecerCerrandoSesion(true)
    establecerErrorCierreSesion('')
    try {
      await api.cerrarSesion()
      await alCerrarSesion?.()
      establecerUsuario(null)
      return true
    } catch {
      establecerErrorCierreSesion('No se pudo cerrar la sesión. Inténtalo nuevamente.')
      return false
    } finally { establecerCerrandoSesion(false) }
  }
  const valor = {
    usuario, iniciarSesion, cerrarSesion, cerrandoSesion, errorCierreSesion,
    actualizarPerfil: async datos => {
      const perfil = asignarRutasPermitidas(await api.actualizarCuenta(datos))
      establecerUsuario(perfil)
      return perfil
    },
    vistaPreviaDisponible: import.meta.env.DEV,
    iniciarVistaPrevia: () => { if (import.meta.env.DEV) establecerUsuario(usuarioVistaPrevia) },
  }
  return <ContextoSesion.Provider value={valor}><ProveedorAccesibilidad key={usuario?.id ?? usuario?.correo ?? 'sin-sesion'} usuario={usuario}><ProveedorNotificaciones key={usuario?.id ?? usuario?.correo ?? 'sin-sesion'} usuario={usuario}>{children}</ProveedorNotificaciones></ProveedorAccesibilidad></ContextoSesion.Provider>
}
