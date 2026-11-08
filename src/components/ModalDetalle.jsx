import DetalleContenido from './DetalleContenido'
export default function ModalDetalle(props) {
  if (!props.alerta) return null
  return <DetalleContenido key={props.alerta.id+':'+(props.alerta.fecha_evaluacion || '')} {...props} />
}
