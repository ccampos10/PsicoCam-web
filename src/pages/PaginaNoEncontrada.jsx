import { Link } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
export default function PaginaNoEncontrada() {
  const { usuario } = useSesion()
  return <section className="placeholder-card"><h1>Página no encontrada</h1>
    <p>La dirección solicitada no existe.</p><Link to={usuario?.rutasPermitidas?.[0] || '/login'}>Volver al inicio</Link>
  </section>
}
