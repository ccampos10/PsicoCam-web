import PanelEstadistica from './PanelEstadistica'

export default function ListaBoxes({ boxes }) {
  return <PanelEstadistica titulo="Boxes clínicos" etiqueta="Boxes clínicos" descripcion={`${boxes.length} boxes designados para monitoreo`}>
    <ul className="lista-basica" role="list">
      {boxes.map(box => <li key={box}>
        <span className="punto-estado" aria-hidden="true"></span>
        <span className="lista-nombre">{box}</span>
        <span className="lista-estado">Monitoreando</span>
      </li>)}
    </ul>
  </PanelEstadistica>
}