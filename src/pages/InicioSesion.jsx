import { matchPath, Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import FormularioInicioSesion from '../components/FormularioInicioSesion'
import PanelPresentacionSesion from '../components/PanelPresentacionSesion'
import '../styles/inicioSesion.css'

export default function InicioSesion({ rutasDisponibles = [], alEnviar }) {
  const { usuario, iniciarSesion, vistaPreviaDisponible, iniciarVistaPrevia } = useSesion()
  const { state } = useLocation()
  const rutaSolicitada = state?.rutaSolicitada
  const mensajeInicial = state?.sesionExpirada === true ? 'Tu sesión ha expirado. Inicia sesión nuevamente.' : ''
  const destinoInterno = typeof rutaSolicitada === 'string' && rutasDisponibles.some(opcion =>
    matchPath(opcion.ruta, rutaSolicitada.split(/[?#]/)[0]))
  if (usuario) return <Navigate to={destinoInterno ? rutaSolicitada : usuario.rutasPermitidas?.[0] || '/dashboard'} replace />
  return <main className="inicio-sesion">
    <PanelPresentacionSesion />
    <div className="acceso-area-formulario">
      <div className="acceso-contenedor">
        <FormularioInicioSesion alEnviar={alEnviar || iniciarSesion} mensajeInicial={mensajeInicial} />
        {vistaPreviaDisponible && <details className="acceso-desarrollo">
          <summary>Vista previa de desarrollo</summary>
          <p>Solo permite revisar la interfaz: no inicia sesión ni da acceso a datos protegidos. Para consultar datos, inicia sesión con una cuenta del backend.</p>
          <button className="button-secondary" onClick={iniciarVistaPrevia}>Abrir vista previa</button>
        </details>}
      </div>
    </div>
  </main>
}
