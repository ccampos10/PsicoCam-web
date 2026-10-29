import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfiguracionForm } from '../src/components/ConfiguracionForm/ConfiguracionForm'

const inicial = { horaInicio: '08:00', horaTermino: '22:00', correoCliente: '', modoCorreo: 'asignado', incluirAdministradores: false }

describe('Configuración de destinatarios', () => {
  it('guarda la opción elegida y permite reiniciar cambios', async () => {
    const interaccion = userEvent.setup()
    const guardar = vi.fn().mockResolvedValue(undefined)
    render(<ConfiguracionForm valoresIniciales={inicial} onGuardar={guardar} esAdmin />)
    await interaccion.click(screen.getByLabelText(/Todos los usuarios activos/))
    await interaccion.click(screen.getByLabelText(/Enviar también a todos los administradores activos/))
    await interaccion.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(guardar).toHaveBeenCalledWith({ ...inicial, modoCorreo: 'todos', incluirAdministradores: true })
    await interaccion.click(screen.getByRole('button', { name: 'Reiniciar valores' }))
    expect(screen.getByLabelText(/Usuario asignado a la alerta/).checked).toBe(true)
  })
  it('no muestra opciones administrativas a un supervisor', () => {
    render(<ConfiguracionForm valoresIniciales={inicial} onGuardar={vi.fn()} esAdmin={false} />)
    expect(screen.queryByLabelText(/Todos los usuarios activos/)).toBeNull()
    expect(screen.queryByLabelText('Hora de inicio')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
  })
})
