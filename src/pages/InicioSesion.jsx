import { matchPath, Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import FormularioInicioSesion from '../components/FormularioInicioSesion'
import logoUa from '../assets/ua-logo.png'
import '../styles/inicioSesion.css'

export default function InicioSesion({ rutasDisponibles = [], alEnviar }) {
  const { usuario, iniciarSesion, vistaPreviaDisponible, iniciarVistaPrevia } = useSesion()
  const { state } = useLocation()
  const rutaSolicitada = state?.rutaSolicitada
  const destinoInterno = typeof rutaSolicitada === 'string' && rutasDisponibles.some(opcion =>
    matchPath(opcion.ruta, rutaSolicitada.split(/[?#]/)[0]))
  if (usuario) return <Navigate to={destinoInterno ? rutaSolicitada : usuario.rutasPermitidas?.[0] || '/dashboard'} replace />
  return <main className="inicio-sesion">
    <section className="acceso-panel-marca" aria-labelledby="titulo-presentacion">
      <img className="acceso-logo-ua" src={logoUa} alt="Universidad Autónoma" width="141" height="197" />
      <div className="acceso-presentacion">
        <p className="acceso-antetitulo">PSICOCAM - MONITOREO CLÍNICO</p>
        <h2 id="titulo-presentacion">Supervisión<br />continua de los<br /><span>boxes clínicos</span></h2>
        <p className="acceso-descripcion">Detección temprana de señales de riesgo suicida (RS) y<br className="acceso-salto-descripcion" /> vulneración de derechos (VD) para una respuesta clínica<br className="acceso-salto-descripcion" /> oportuna.</p>
      </div>
    </section>
    <div className="acceso-area-formulario">
      <div className="acceso-contenedor">
        <FormularioInicioSesion alEnviar={alEnviar || iniciarSesion} />
        {vistaPreviaDisponible && <details className="acceso-desarrollo">
          <summary>Vista previa de desarrollo</summary>
          <p>Solo permite revisar la interfaz: no inicia sesión ni da acceso a datos protegidos. Para consultar datos, inicia sesión con una cuenta del backend.</p>
          <button className="button-secondary" onClick={iniciarVistaPrevia}>Abrir vista previa</button>
        </details>}
      </div>
    </div>
  </main>
}
