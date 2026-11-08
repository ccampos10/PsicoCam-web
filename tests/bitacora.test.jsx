import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Bitacora from '../src/pages/Bitacora'
import { ApiBitacoraRepository } from '../src/repositories/ApiBitacoraRepository'

const registros = [
  { id: '1', fecha: '2026-09-24', hora: '09:00', usuario: 'Ana', nivel: 'Información', accion: 'clasificar_alerta', descripcion: 'Alerta evaluada' },
  { id: '2', fecha: '2026-09-25', hora: '10:00', usuario: 'Sistema', nivel: 'Advertencia', accion: 'envio_notificacion', descripcion: 'Error de envío' },
]

describe('Bitácora', () => {
  it('muestra datos reales, ordena por fecha y permite filtrar y abrir el detalle', async () => {
    const usuario = userEvent.setup()
    render(<Bitacora repositorio={{ listarRegistros: vi.fn().mockResolvedValue(registros) }} />)
    expect(await screen.findByText('Mostrando 2 de 2 eventos')).toBeTruthy()
    expect(screen.getByLabelText('Categorías de eventos').textContent).toContain('Evento técnico / integración')
    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(within(filas[0]).getByText('Sistema')).toBeTruthy()
    await usuario.type(screen.getByLabelText('Desde'), '2026-09-25')
    expect(screen.getByText('Mostrando 1 de 2 eventos')).toBeTruthy()
    expect(within(screen.getByRole('table')).queryByText('Ana')).toBeNull()
    await usuario.click(screen.getByRole('button', { name: 'Ver detalles de envio notificacion' }))
    expect(within(screen.getByRole('dialog', { name: 'Detalles del registro' })).getByText('Error de envío')).toBeTruthy()
    expect(within(screen.getByRole('dialog')).getByText('2')).toBeTruthy()
    expect(within(screen.getByRole('dialog')).getByText('Evento técnico / integración')).toBeTruthy()
    await usuario.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('muestra errores y permite reintentar', async () => {
    const usuario = userEvent.setup()
    const listarRegistros = vi.fn().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(registros)
    render(<Bitacora repositorio={{ listarRegistros }} />)
    expect((await screen.findByRole('alert')).textContent).toContain('Sin conexión')
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Mostrando 2 de 2 eventos')).toBeTruthy()
  })

  it('conserva la acción que entrega la API', async () => {
    const fetchOriginal = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: 'qa-1', fecha: '2026-09-24', hora: '09:00', usuario: 'Ana', nivel: 'Información', detalle: 'Detalle', accion: 'clasificar_alerta' }]), { status: 200 }))
    try {
      const datos = await new ApiBitacoraRepository().listarRegistros()
      expect(datos[0].accion).toBe('clasificar_alerta')
    } finally {
      globalThis.fetch = fetchOriginal
    }
  })
})
