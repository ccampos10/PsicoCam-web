import { useEffect, useRef } from 'react'

export default function Modal({ children, className = '', idTitulo, alCerrar }) {
  const referencia = useRef(null)
  useEffect(() => {
    const dialogo = referencia.current
    const focoAnterior = document.activeElement
    const desbordamientoAnterior = document.body.style.overflow
    dialogo.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialogo.close()
      document.body.style.overflow = desbordamientoAnterior
      if (focoAnterior?.isConnected) focoAnterior.focus()
    }
  }, [])
  return <dialog ref={referencia} className={className} aria-labelledby={idTitulo}
    onCancel={evento => { evento.preventDefault(); alCerrar() }}
    onClick={evento => {
      if (evento.target !== evento.currentTarget) return
      const limites = evento.currentTarget.getBoundingClientRect()
      if (evento.clientX < limites.left || evento.clientX > limites.right || evento.clientY < limites.top || evento.clientY > limites.bottom) alCerrar()
    }}>{children}</dialog>
}
