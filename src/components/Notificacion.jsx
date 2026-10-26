import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, CircleX, Info, X } from 'lucide-react'
import styles from './Notificacion.module.css'

const TIPOS = {
  exito: { Icono: Check, clase: styles.exito },
  advertencia: { Icono: AlertTriangle, clase: styles.advertencia },
  error: { Icono: CircleX, clase: styles.error },
  informacion: { Icono: Info, clase: styles.informacion },
}

export default function Notificacion({
  tipo = 'informacion',
  titulo,
  mensaje,
  alCerrar,
  duracion = 10000,
  className = '',
}) {
  const [visible, setVisible] = useState(true)
  const referenciaAlCerrar = useRef(alCerrar)
  const tipoValido = TIPOS[tipo] ? tipo : 'informacion'
  const { Icono, clase } = TIPOS[tipoValido]

  useEffect(() => {
    referenciaAlCerrar.current = alCerrar
  }, [alCerrar])

  useEffect(() => {
    if (!visible) return
    const temporizador = setTimeout(() => {
      setVisible(false)
      referenciaAlCerrar.current?.()
    }, duracion)
    return () => clearTimeout(temporizador)
  }, [duracion, visible])

  if (!visible) return null

  const cerrar = () => {
    setVisible(false)
    alCerrar?.()
  }

  return (
    <div
      className={`${styles.notificacion} ${clase} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-tipo={tipoValido}
    >
      <span className={styles.icono} aria-hidden="true">
        <Icono size={16} />
      </span>
      <div className={styles.contenido}>
        {titulo && <p className={styles.titulo}>{titulo}</p>}
        {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
      </div>
      <button
        type="button"
        className={styles.cerrar}
        onClick={cerrar}
        aria-label="Cerrar notificación"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
