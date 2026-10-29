import PanelEstadistica from './PanelEstadistica'
import { Link } from 'react-router-dom'

const nivelTexto = { bajo: 'Riesgo bajo', medio: 'Riesgo medio', alto: 'Riesgo alto' }
const nivelClase = { bajo: 'riesgo-bajo', medio: 'riesgo-medio', alto: 'riesgo-alto' }

export default function ListaAlertasRecientes({ alertas }) {
  return <PanelEstadistica titulo="Alertas recientes" etiqueta="Alertas recientes" descripcion="Información mínima para respuesta clínica">
    {alertas.length === 0 ? <p className="panel-vacio">No hay alertas registradas.</p> : <ul className="lista-alertas" role="list">
      {alertas.map((alerta, indice) => <li key={alerta.id ?? `${alerta.box}-${alerta.hora}-${indice}`}>
        <span className={`punto-estado ${nivelClase[alerta.nivel]}`} aria-hidden="true"></span>
        <span className="alerta-box">{alerta.box}</span>
        <span className="alerta-tipo">{alerta.tipo}</span>
        <span className={`alerta-nivel ${alerta.nivel}`}>{nivelTexto[alerta.nivel] || 'Nivel no disponible'}</span>
        <time>{alerta.hora}</time>
      </li>)}
    </ul>}
    <Link className="panel-enlace" to="/alertas">Ver todas las alertas <span aria-hidden="true">→</span></Link>
  </PanelEstadistica>
}
