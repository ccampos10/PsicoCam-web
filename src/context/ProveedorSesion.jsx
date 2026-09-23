import { useState } from 'react'
import { ContextoSesion } from './ContextoSesion'
import { navegacion } from '../routes/navegacion'

// Perfil de prueba para la vista previa, TODAVIA NO HAY BD
const usuarioVistaPrevia = {
  nombre: 'Usuario', rol: 'Profesional',
  rutasPermitidas: navegacion.map(({ ruta }) => ruta),
}

export function ProveedorSesion({ children, usuarioInicial = null, alCerrarSesion }) {
  const [usuario, establecerUsuario] = useState(usuarioInicial)
  const [errorCierreSesion, establecerErrorCierreSesion] = useState('')
  const [cerrandoSesion, establecerCerrandoSesion] = useState(false)
  async function cerrarSesion() {
    establecerCerrandoSesion(true)
    establecerErrorCierreSesion('')
    try {
      await alCerrarSesion?.()
      establecerUsuario(null)
      return true
    } catch {
      establecerErrorCierreSesion('No se pudo cerrar la sesión. Inténtalo nuevamente.')
      return false
    } finally { establecerCerrandoSesion(false) }
  }
  const valor = {
    usuario, cerrarSesion, cerrandoSesion, errorCierreSesion,
    vistaPreviaDisponible: import.meta.env.DEV,
    iniciarVistaPrevia: () => { if (import.meta.env.DEV) establecerUsuario(usuarioVistaPrevia) },
  }
  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}
