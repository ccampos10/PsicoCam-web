import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalDetalle from '../components/ModalDetalle'
import { api } from '../services/api'
export default function CargarDetalle({ id, titulo }) {
  const [alerta, setAlerta] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [intento, setIntento] = useState(0)
  const navegar = useNavigate()
  useEffect(() => {
    let vigente = true
    async function cargar() {
      setCargando(true); setError('')
      try { const datos = await api.obtenerAlerta(id); if (vigente) setAlerta(datos) }
      catch (fallo) { if (vigente) setError(fallo.message || 'No se pudo cargar la alerta.') }
      finally { if (vigente) setCargando(false) }
    }
    cargar()
    return () => { vigente = false }
  }, [id, intento])
  async function guardar(actual, evaluacion, notas) { const datos = await api.actualizarEvaluacion(actual.id, evaluacion, notas); setAlerta(datos); setMensaje('Evaluación guardada correctamente.') }
  return <section aria-labelledby="page-title"><h1 id="page-title" className="page-title">{titulo || 'Detalle de alerta'}</h1>{mensaje && <p role="status">{mensaje}</p>}
    {cargando ? <p role="status">Cargando alerta...</p> : error ? <div className="placeholder-card" role="alert"><p>{error}</p><button type="button" className="button-primary" onClick={() => setIntento(v => v + 1)}>Reintentar</button></div> : <ModalDetalle alerta={alerta} onGuardar={guardar} onCerrar={() => navegar('/alertas')} enPagina />}
  </section>
}
