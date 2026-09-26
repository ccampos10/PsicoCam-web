import { useState, useEffect } from 'react';
import styles from './ModalDetalle.module.css';

const ModalDetalle = ({ alerta, onCerrar, onGuardar }) => {
  const [evaluacion, setEvaluacion] = useState('');

  useEffect(() => {
    if (alerta) setEvaluacion('');
  }, [alerta]);

  if (!alerta) return null;

  const getEstilosRiesgo = (nivel) => {
    if (nivel === 'Alto') return { dot: styles.dotAlto, text: styles.textAlto };
    if (nivel === 'Medio') return { dot: styles.dotMedio, text: styles.textMedio };
    return { dot: styles.dotBajo, text: styles.textBajo };
  };

  const estilosRiesgo = getEstilosRiesgo(alerta.nivel);

  const handleSubmit = () => {
    if (!evaluacion) return;
    onGuardar(alerta, evaluacion);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Detalle de alerta</h2>
            <p className={styles.subtitle}>Información asociada al evento detectado</p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar" className={styles.closeBtn}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </header>

        <section className={styles.body}>
          <div className={styles.lista}>
            <div className={styles.row}>
              <span className={styles.label}>Box</span>
              <span className={styles.value}>{alerta.box}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Nivel de urgencia</span>
              <span className={`${styles.value} ${estilosRiesgo.text}`}>
                <span className={estilosRiesgo.dot}></span>
                {alerta.nivel}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Hora</span>
              <span className={styles.value} style={{ fontFamily: 'monospace' }}>{alerta.fecha || 'No registrada'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Estado actual</span>
              <span className={styles.value}>{alerta.estado}</span>
            </div>
          </div>

          <div className={styles.evalForm}>
            <p className={styles.evalTitle}>Registrar evaluación clínica</p>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="evaluacion" 
                  value="Correcta" 
                  checked={evaluacion === 'Correcta'}
                  onChange={(e) => setEvaluacion(e.target.value)}
                />
                <span>Alerta Correcta</span>
              </label>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="evaluacion" 
                  value="Falso Positivo" 
                  checked={evaluacion === 'Falso Positivo'}
                  onChange={(e) => setEvaluacion(e.target.value)}
                />
                <span>Falso Positivo</span>
              </label>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="evaluacion" 
                  value="Neutro" 
                  checked={evaluacion === 'Neutro'}
                  onChange={(e) => setEvaluacion(e.target.value)}
                />
                <span>Neutro / No concluyente</span>
              </label>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <button onClick={onCerrar} type="button" className={styles.btnCancel}>
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!evaluacion}
            className={styles.btnSubmit}
            style={{ opacity: !evaluacion ? 0.5 : 1, cursor: !evaluacion ? 'not-allowed' : 'pointer' }}
          >
            Guardar Evaluación
          </button>
        </footer>

      </div>
    </div>
  );
};

export default ModalDetalle;