import { useEffect, useRef } from 'react'

export default function PanelDesplegable({ id, etiqueta, activador, abierto, alAlternar, alCerrar, children, className = '' }) {
  const referencia = useRef(null)
  const referenciaBoton = useRef(null)
  useEffect(() => {
    if (!abierto) return
    const cerrarDesdeFuera = evento => { if (!referencia.current.contains(evento.target)) alCerrar() }
    const cerrarConEscape = evento => {
      if (evento.key === 'Escape') { alCerrar(); referenciaBoton.current.focus() }
    }
    document.addEventListener('pointerdown', cerrarDesdeFuera)
    document.addEventListener('focusin', cerrarDesdeFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('pointerdown', cerrarDesdeFuera)
      document.removeEventListener('focusin', cerrarDesdeFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierto, alCerrar])
  return <div ref={referencia} className={`popover ${className}`}>
    <button ref={referenciaBoton} className="navbar-button" aria-label={etiqueta} aria-expanded={abierto}
      aria-controls={id} onClick={alAlternar}>{activador}</button>
    {abierto && <div className="popover-panel" id={id} aria-label={etiqueta}>{children}</div>}
  </div>
}
