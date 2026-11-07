import { useParams } from 'react-router-dom'
import CargarDetalle from './CargarDetalle'
export default function DetalleAlerta({ titulo }) {
  const { idAlerta } = useParams()
  return <CargarDetalle key={idAlerta} id={idAlerta} titulo={titulo} />
}
