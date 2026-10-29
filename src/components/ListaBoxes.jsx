import PanelEstadistica from './PanelEstadistica'

export default function ListaBoxes({ boxes }) {
  return <PanelEstadistica titulo="Boxes clínicos" etiqueta="Boxes clínicos" descripcion={`${boxes.length} boxes con alertas registradas`}>
    {boxes.length === 0 ? <p className="panel-vacio">No hay boxes con alertas registradas.</p> : <ul className="lista-basica" role="list">
      {boxes.map(box => <li key={box}>
        <span className="punto-estado" aria-hidden="true"></span>
        <span className="lista-nombre">{box}</span>
      </li>)}
    </ul>}
  </PanelEstadistica>
}
