import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RestablecerContrasena from '../src/pages/RestablecerContrasena'

describe('Restablecimiento de contraseña', () => {
  it('permite mostrar y ocultar ambos campos de forma independiente', async () => {
    render(<MemoryRouter initialEntries={['/restablecer-contrasena?token=token-prueba']}>
      <RestablecerContrasena />
    </MemoryRouter>)

    const interaccion = userEvent.setup()
    const nueva = screen.getByLabelText('Nueva contraseña')
    const confirmacion = screen.getByLabelText('Confirmar nueva contraseña')

    expect(nueva.type).toBe('password')
    expect(confirmacion.type).toBe('password')

    await interaccion.click(screen.getByRole('button', { name: 'Mostrar nueva contraseña' }))
    expect(nueva.type).toBe('text')
    expect(confirmacion.type).toBe('password')

    await interaccion.click(screen.getByRole('button', { name: 'Mostrar confirmación de contraseña' }))
    expect(confirmacion.type).toBe('text')

    await interaccion.click(screen.getByRole('button', { name: 'Ocultar nueva contraseña' }))
    await interaccion.click(screen.getByRole('button', { name: 'Ocultar confirmación de contraseña' }))
    expect(nueva.type).toBe('password')
    expect(confirmacion.type).toBe('password')
  })
})
