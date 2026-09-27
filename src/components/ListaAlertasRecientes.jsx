import PanelEstadistica from './PanelEstadistica'

const nivelTexto = { bajo: 'Riesgo bajo', medio: 'Riesgo medio', alto: 'Riesgo alto' }
const nivelClase = { bajo: 'riesgo-bajo', medio: 'riesgo-medio', alto: 'riesgo-alto' }

export default function ListaAlertasRecientes({ alertas }) {
  return <PanelEstadistica titulo="Alertas recientes" etiqueta="Alertas recientes" descripcion="Información mínima para respuesta clínica">
    <ul className="lista-alertas" role="list">
      {alertas.map(alerta => <li key={`${alerta.box}-${alerta.hora}`}>
        <span className={`punto-estado ${nivelClase[alerta.nivel]}`} aria-hidden="true"></span>
        <span className="alerta-box">{alerta.box}</span>
        <span className="alerta-tipo">{alerta.tipo}</span>
        <span className={`alerta-nivel ${alerta.nivel}`}>{nivelTexto[alerta.nivel]}</span>
        <time>{alerta.hora}</time>
      </li>)}
    </ul>
  </PanelEstadistica>
}