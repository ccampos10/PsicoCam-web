import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormularioInicioSesion from '../src/components/FormularioInicioSesion'

describe('Formulario visual de inicio de sesión', () => {
  it('exige ambos campos y enfoca el primero incompleto', async () => {
    const alEnviar = vi.fn()
    render(<FormularioInicioSesion alEnviar={alEnviar} />)
    const interaccion = userEvent.setup()
    await interaccion.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(document.activeElement).toBe(screen.getByLabelText('Usuario o correo electrónico'))
    expect(alEnviar).not.toHaveBeenCalled()
  })

  it('captura las credenciales, alterna su visibilidad y entrega los datos por Enter', async () => {
    const alEnviar = vi.fn().mockResolvedValue(undefined)
    render(<FormularioInicioSesion alEnviar={alEnviar} />)
    const interaccion = userEvent.setup()
    const contrasena = screen.getByLabelText('Contraseña', { exact: true })
    await interaccion.type(screen.getByLabelText('Usuario o correo electrónico'), ' usuario.prueba ')
    await interaccion.type(contrasena, ' clave de prueba ')
    expect(contrasena.type).toBe('password')
    await interaccion.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(contrasena.type).toBe('text')
    await interaccion.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(contrasena.type).toBe('password')
    await interaccion.click(screen.getByLabelText('Recordarme'))
    await interaccion.click(contrasena)
    await interaccion.keyboard('{Enter}')
    expect(alEnviar).toHaveBeenCalledExactlyOnceWith({ usuario: 'usuario.prueba', contrasena: ' clave de prueba ', recordarme: true })
  })

  it('informa la falta de integración y ofrece ayuda sin simular autenticación', async () => {
    render(<FormularioInicioSesion />)
    const interaccion = userEvent.setup()
    await interaccion.type(screen.getByLabelText('Usuario o correo electrónico'), 'usuario.prueba')
    await interaccion.type(screen.getByLabelText('Contraseña', { exact: true }), 'clave de prueba')
    await interaccion.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getByRole('status').textContent).toContain('no está disponible')
    await interaccion.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }))
    expect(screen.getByRole('status').textContent).toContain('contacta al administrador')
  })

  it('permite reintentar después de un fallo sin mostrar datos del error recibido', async () => {
    render(<FormularioInicioSesion alEnviar={vi.fn().mockRejectedValue(new Error('detalle interno'))} />)
    const interaccion = userEvent.setup()
    await interaccion.type(screen.getByLabelText('Usuario o correo electrónico'), 'usuario.prueba')
    await interaccion.type(screen.getByLabelText('Contraseña', { exact: true }), 'clave de prueba')
    await interaccion.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('No se pudo iniciar sesión. Inténtalo nuevamente.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' }).disabled).toBe(false)
    expect(screen.queryByText('detalle interno')).toBeNull()
  })
})
