import { useEffect, useState } from 'react'
import styles from './ModalDetalle.module.css'

export default function ModalDetalle({ alerta, onCerrar, onGuardar }) {
  const [evaluacion, setEvaluacion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!alerta) return
    setEvaluacion('')
    setError('')
  }, [alerta])

  if (!alerta) return null

  const estilosRiesgo = alerta.nivel === 'Alto'
    ? { dot: styles.dotAlto, text: styles.textAlto }
    : alerta.nivel === 'Medio'
      ? { dot: styles.dotMedio, text: styles.textMedio }
      : { dot: styles.dotBajo, text: styles.textBajo }
  const estado = alerta.estado_evaluacion === 'neutro'
    ? 'Pendiente'
    : alerta.estado_evaluacion || 'Pendiente'

  async function guardarEvaluacion() {
    if (!evaluacion || guardando) return
    setGuardando(true)
    setError('')
    try {
      await onGuardar(alerta, evaluacion)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar la evaluación.')
    } finally {
      setGuardando(false)
    }
  }

  return <div className={styles.overlay} role="dialog" aria-modal="true">
    <div className={styles.modal}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Detalle de alerta</h2>
          <p className={styles.subtitle}>Información asociada al evento detectado</p>
        </div>
        <button onClick={onCerrar} aria-label="Cerrar" className={styles.closeBtn} disabled={guardando}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <section className={styles.body}>
        <div className={styles.lista}>
          <div className={styles.row}><span className={styles.label}>Box</span><span className={styles.value}>{alerta.box}</span></div>
          <div className={styles.row}><span className={styles.label}>Nivel de urgencia</span><span className={`${styles.value} ${estilosRiesgo.text}`}><span className={estilosRiesgo.dot} />{alerta.nivel}</span></div>
          <div className={styles.row}><span className={styles.label}>Hora</span><span className={styles.value} style={{ fontFamily: 'monospace' }}>{[alerta.fecha, alerta.hora].filter(Boolean).join(' ') || 'No registrada'}</span></div>
          <div className={styles.row}><span className={styles.label}>Estado actual</span><span className={styles.value}>{estado}</span></div>
        </div>

        <div className={styles.evalForm}>
          <p className={styles.evalTitle}>Registrar evaluación clínica</p>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="evaluacion" value="correcta" checked={evaluacion === 'correcta'} onChange={(evento) => setEvaluacion(evento.target.value)} disabled={guardando} />
              <span>Alerta correcta</span>
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="evaluacion" value="falso positivo" checked={evaluacion === 'falso positivo'} onChange={(evento) => setEvaluacion(evento.target.value)} disabled={guardando} />
              <span>Falso positivo</span>
            </label>
          </div>
          {error && <p role="alert">{error}</p>}
        </div>
      </section>

      <footer className={styles.footer}>
        <button onClick={onCerrar} type="button" className={styles.btnCancel} disabled={guardando}>Cancelar</button>
        <button type="button" onClick={guardarEvaluacion} disabled={!evaluacion || guardando} className={styles.btnSubmit}>
          {guardando ? 'Guardando...' : 'Guardar evaluación'}
        </button>
      </footer>
    </div>
  </div>
}
