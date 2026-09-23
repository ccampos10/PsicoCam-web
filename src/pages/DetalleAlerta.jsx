import { useParams } from 'react-router-dom'

// La consulta de datos y la evaluación clínica se integrarán posteriormente.
export default function DetalleAlerta({ titulo }) {
  const { idAlerta } = useParams()
  return <section aria-labelledby="page-title">
    <h1 id="page-title" className="page-title">{titulo}</h1>
    <p>Identificador de alerta: {idAlerta}</p>
  </section>
}
