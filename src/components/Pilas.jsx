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

  return <div className="pilaContenedor">
    <p className={clase}>{valor}</p>
  </div>
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

  return <div className="pilaContenedor">
    <p className={clase}>{valor}</p>
  </div>
}