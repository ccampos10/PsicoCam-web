import "../styles/pilas.css"

export const ColorUrgencia = ({valor}) => {
  let clase = "urgBajo"

  if (valor === "Bajo") {
    clase = "urgBajo"
  }
  else if (valor === "Medio") {
    clase = "urgMedio"
  }
  else if (valor === "Alto") {
    clase = "urgAlto"
  }

  return <span className={`pill ${clase}`}>
    <span className="iconoUrgencia" aria-hidden="true">{valor === 'Bajo' ? '✓' : valor === 'Medio' ? '△' : '!'}</span>
    {valor}
  </span>
}

export const ColorNivel = ({valor}) => {
  let clase = "nivelInfo"

  if (valor === "Información") {
    clase = "nivelInfo"
  }
  else if (valor === "Advertencia") {
    clase = "nivelAdver"
  }
  else if (valor === "Grave") {
    clase = "nivelGrave"
  }

  return <div className="pill">
    <p className={clase}>{valor}</p>
  </div>
}
