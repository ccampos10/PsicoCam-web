import PanelEstadistica from './PanelEstadistica'

export default function ProgresoDetecciones({ datos }) {
  const total = datos.reduce((suma, dato) => suma + dato.alertas, 0)
  return <PanelEstadistica titulo="Alertas por tipo de detección" etiqueta="Alertas por tipo de detección" descripcion="RS / VD">
    <div className="progreso-lista">
      {datos.map(dato => {
        const porcentaje = total ? Math.round((dato.alertas / total) * 100) : 0
        return <div className="progreso-item" key={dato.abreviatura}>
          <div className="progreso-fila">
            <span className="progreso-nombre">{dato.nombre} <span className="progreso-abreviatura">({dato.abreviatura})</span></span>
            <span className="progreso-cantidad">{dato.alertas} {dato.alertas === 1 ? 'alerta' : 'alertas'}</span>
          </div>
          <div className="progreso-pista"><div className="progreso-relleno" style={{ width: `${porcentaje}%`, '--progreso-color': dato.color }}></div></div>
        </div>
      })}
    </div>
  </PanelEstadistica>
}
