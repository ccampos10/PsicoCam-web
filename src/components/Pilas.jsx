import "../styles/pilas.css"

export const ColorUrgencia = ({valor}) => {
  let clase = "urgBajo"
  let claseDot = "dotBajo"

  if (valor === "Bajo") {
    clase = "urgBajo"
    claseDot = "dotBajo"
  }
  else if (valor === "Medio") {
    clase = "urgMedio"
    claseDot = "dotMedio"
  }
  else if (valor === "Alto") {
    clase = "urgAlto"
    claseDot = "dotAlto"
  }

  return <span className={`pill ${clase}`}>
    <span className={`dot ${claseDot}`}></span>
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