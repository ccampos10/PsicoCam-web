export default function PanelEstadistica({ titulo, descripcion, etiqueta, children }) {
  return <section className="panel-estadistica" aria-label={etiqueta || titulo}>
    <div className="panel-cabecera">
      <h2>{titulo}</h2>
      {descripcion && <p>{descripcion}</p>}
    </div>
    <div className="panel-contenido">{children}</div>
  </section>
}