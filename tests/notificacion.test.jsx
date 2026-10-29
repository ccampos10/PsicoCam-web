import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Notificacion from '../src/components/Notificacion'

describe('Notificacion: SCRUM-658', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('muestra el título, el mensaje y el tipo de alerta indicado', () => {
    render(
      <Notificacion
        tipo="exito"
        titulo="Cambios guardados"
        mensaje="La configuración se actualizó correctamente."
      />
    )

    const notificacion = screen.getByRole('status')
    expect(notificacion.getAttribute('data-tipo')).toBe('exito')
    expect(screen.getByText('Cambios guardados')).toBeTruthy()
    expect(screen.getByText('La configuración se actualizó correctamente.')).toBeTruthy()
    expect(notificacion.querySelector('svg')).toBeTruthy()
  })

  it.each(['exito', 'advertencia', 'error', 'informacion'])(
    'permite seleccionar el tipo de alerta "%s"',
    (tipo) => {
      render(<Notificacion tipo={tipo} titulo="Aviso" mensaje="Contenido" />)

      expect(screen.getByRole('status').getAttribute('data-tipo')).toBe(tipo)
    }
  )

  it('usa el tipo información cuando recibe un tipo desconocido', () => {
    render(<Notificacion tipo="desconocido" titulo="Aviso" />)

    expect(screen.getByRole('status').getAttribute('data-tipo')).toBe('informacion')
  })

  it('se cierra al pulsar el botón y notifica el cierre', () => {
    const alCerrar = vi.fn()
    render(<Notificacion titulo="Aviso" mensaje="Contenido" alCerrar={alCerrar} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))

    expect(alCerrar).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('se cierra automáticamente después de 10 segundos', () => {
    const alCerrar = vi.fn()
    render(<Notificacion titulo="Aviso" mensaje="Contenido" alCerrar={alCerrar} />)

    act(() => {
      vi.advanceTimersByTime(9999)
    })
    expect(screen.getByRole('status')).toBeTruthy()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(screen.queryByRole('status')).toBeNull()
    expect(alCerrar).toHaveBeenCalledTimes(1)
  })
})
