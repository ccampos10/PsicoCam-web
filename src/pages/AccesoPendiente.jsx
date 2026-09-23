import { Navigate } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import Marca from '../components/Marca'

export default function AccesoPendiente() {
  const { usuario, vistaPreviaDisponible, iniciarVistaPrevia } = useSesion()
  if (usuario) return <Navigate to={usuario.rutasPermitidas?.[0] || '/dashboard'} replace />
  return <main className="standalone-page"><div className="entry-card">
    <div className="entry-brand"><Marca /></div>
    <div className="entry-content"><h1>Acceso a PsicoCam</h1>
      {vistaPreviaDisponible && <><p>Vista previa de desarrollo.</p>
        <button className="button-primary" onClick={iniciarVistaPrevia}>Abrir vista previa</button></>}
    </div>
  </div></main>
}
