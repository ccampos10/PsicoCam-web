import { useEffect, useRef, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import Modal from './Modal'
import { ColorUrgencia } from './Pilas'
import { api } from '../services/api'
import styles from './ModalDetalle.module.css'

const categorias = { RS: 'Riesgo Suicida (RS)', VD: 'Vulneración de Derechos (VD)' }

export default function ModalDetalle({ alerta, onCerrar, onGuardar }) {
  const [evaluacion, setEvaluacion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [transcripcion, setTranscripcion] = useState(null)
  const [transcripcionAbierta, setTranscripcionAbierta] = useState(false)
  const [cargandoTranscripcion, setCargandoTranscripcion] = useState(false)
  const [errorTranscripcion, setErrorTranscripcion] = useState('')
  const solicitud = useRef(0)

  useEffect(() => {
    solicitud.current += 1
    if (!alerta) return
    setEvaluacion('')
    setError('')
    setTranscripcion(null)
    setTranscripcionAbierta(false)
    setCargandoTranscripcion(false)
    setErrorTranscripcion('')
    return () => { solicitud.current += 1 }
  }, [alerta])

  if (!alerta) return null

  async function alternarTranscripcion() {
    if (transcripcionAbierta) {
      setTranscripcionAbierta(false)
      setTranscripcion(null)
      setErrorTranscripcion('')
      solicitud.current += 1
      setCargandoTranscripcion(false)
      return
    }
    setTranscripcionAbierta(true)
    setCargandoTranscripcion(true)
    setErrorTranscripcion('')
    const actual = ++solicitud.current
    try {
      const datos = await api.obtenerTranscripcion(alerta.id)
      if (actual === solicitud.current) setTranscripcion(datos.conversacion || [])
    } catch (fallo) {
      if (actual === solicitud.current) setErrorTranscripcion(fallo.message || 'No se pudo obtener la transcripción.')
    } finally {
      if (actual === solicitud.current) setCargandoTranscripcion(false)
    }
  }

  async function guardarEvaluacion() {
    if (!evaluacion || guardando) return
    setGuardando(true)
    setError('')
    try { await onGuardar(alerta, evaluacion) }
    catch (fallo) { setError(fallo.message || 'No se pudo guardar la evaluación.') }
    finally { setGuardando(false) }
  }

  return <Modal className={styles.modal} idTitulo="detalle-alerta-titulo" alCerrar={() => { if (!guardando) onCerrar() }}>
    <div className={styles.contenido}>
      <header className={styles.header}>
        <div><h2 id="detalle-alerta-titulo">Detalle de alerta</h2><p>Información asociada al evento detectado</p></div>
        <button type="button" onClick={onCerrar} aria-label="Cerrar detalle" className={styles.cerrar} disabled={guardando}><X size={20} aria-hidden="true" /></button>
      </header>
      <div className={styles.body}>
        <dl className={styles.lista}>
          <div><dt>Box</dt><dd>{alerta.box || 'No registrado'}</dd></div>
          <div><dt>Tipo de detección</dt><dd>{categorias[alerta.categoria] || alerta.categoria || 'No registrado'}</dd></div>
          <div><dt>Fecha</dt><dd>{alerta.fecha || 'No registrada'}</dd></div>
          <div><dt>Hora</dt><dd>{alerta.hora || 'No registrada'}</dd></div>
          <div><dt>Supervisor</dt><dd>{alerta.supervisor || 'No registrado'}</dd></div>
          <div><dt>Nivel de urgencia</dt><dd>{['Alto', 'Medio', 'Bajo'].includes(alerta.nivel) ? <ColorUrgencia valor={alerta.nivel} /> : 'No registrado'}</dd></div>
        </dl>
        <section className={styles.evidencia}>
          <h3>Evidencia de la detección</h3>
          <div className={styles.evidenciaCaja}>
            <div className={styles.evidenciaCabecera}><span className={styles.icono}><MessageSquare size={18} aria-hidden="true" /></span>
              <div><strong>Transcripción del evento</strong><p>Acceso restringido al personal autorizado.</p></div>
              <button type="button" className={styles.botonTranscripcion} aria-expanded={transcripcionAbierta} onClick={alternarTranscripcion}>
                {transcripcionAbierta ? 'Ocultar transcripción' : 'Ver transcripción'}
              </button>
            </div>
            {transcripcionAbierta && <div className={styles.transcripcion}>
              {cargandoTranscripcion && <p role="status">Cargando transcripción...</p>}
              {errorTranscripcion && <p role="alert">{errorTranscripcion}</p>}
              {transcripcion && (transcripcion.length ? transcripcion.map((item, indice) => <div className={styles.fragmento} key={indice}>
                <strong>{item.persona || 'Hablante no identificado'}</strong>
                <p>{item.detectado ? <mark>{item.frase}</mark> : item.frase}</p>
              </div>) : <p>No hay transcripción disponible para esta alerta.</p>)}
            </div>}
          </div>
        </section>
        <fieldset className={styles.evaluacion} disabled={guardando}>
          <legend>Evaluación del profesional</legend>
          <label className={styles.opcion}><input type="radio" name="evaluacion" value="correcta" checked={evaluacion === 'correcta'} onChange={e => setEvaluacion(e.target.value)} /><span><strong>Correcta</strong><small>La detección corresponde a una situación real de riesgo.</small></span></label>
          <label className={styles.opcion}><input type="radio" name="evaluacion" value="falso positivo" checked={evaluacion === 'falso positivo'} onChange={e => setEvaluacion(e.target.value)} /><span><strong>Falso positivo</strong><small>La expresión detectada no representa un riesgo real en este contexto.</small></span></label>
          <div className={styles.aviso}>La opción neutra mantiene la alerta pendiente; no se registra como evaluación.</div>
        </fieldset>
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </div>
      <footer className={styles.footer}>
        <button type="button" onClick={guardarEvaluacion} disabled={!evaluacion || guardando} className={styles.guardar}>{guardando ? 'Guardando...' : 'Guardar evaluación'}</button>
        <button onClick={onCerrar} type="button" className={styles.cancelar} disabled={guardando}>Cerrar</button>
      </footer>
    </div>
  </Modal>
}
