export default function TarjetaMetrica({ etiqueta, valor, nota, color, icono: Icono, destacado = false }) {
  return <article className={`tarjeta-metrica${destacado ? ' tarjeta-metrica-destacada' : ''}`} style={{ '--accento': color }}>
    <span className="tarjeta-metrica-cabecera">
      <span className="tarjeta-metrica-etiqueta">{etiqueta}</span>
      {Icono && <span className="tarjeta-metrica-icono"><Icono size={16} aria-hidden="true" /></span>}
    </span>
    <strong className="tarjeta-metrica-valor">{valor}</strong>
    <span className="tarjeta-metrica-nota">{nota}</span>
  </article>
}