export default function TarjetaMetrica({ etiqueta, valor, nota, color, destacado = false }) {
  return <article className={`tarjeta-metrica${destacado ? ' tarjeta-metrica-destacada' : ''}`} style={{ '--accento': color }}>
    <span className="tarjeta-metrica-etiqueta">{etiqueta}</span>
    <strong className="tarjeta-metrica-valor">{valor}</strong>
    <span className="tarjeta-metrica-nota">{nota}</span>
  </article>
}