import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistorialAlertas from '../src/pages/HistorialAlertas'

const datos = [
  { id: '1', box: 'Box 1', categoria: 'RS', nivel: 'Alto', fecha: '2026-10-21', hora: '10:00', supervisor: 'ana@example.cl', estado_evaluacion: 'correcta', fecha_evaluacion: '2026-10-21T14:00:00.000Z' },
  { id: '2', box: 'Box 2', categoria: 'VD', nivel: 'Medio', fecha: '2026-10-20', hora: '11:00', supervisor: 'otro@example.cl', estado_evaluacion: 'falso positivo' },
  { id: '3', box: 'Box 3', categoria: 'RS', nivel: 'Bajo', fecha: '2026-10-19', hora: '12:00', supervisor: 'ana@example.cl', estado_evaluacion: 'neutro' },
]

describe('Historial de alertas', () => {
  it('ordena por evaluación más reciente y deja al final las fechas ausentes o inválidas', async () => {
    const evaluadas = [
      { ...datos[1], fecha_evaluacion: null },
      { ...datos[0], fecha_evaluacion: '2026-10-21T14:00:00.000Z' },
      { ...datos[0], id: '4', box: 'Box 4', fecha_evaluacion: '2026-10-21T15:00:00.000Z' },
      { ...datos[0], id: '5', box: 'Box 5', fecha_evaluacion: 'inválida' },
    ]
    render(<HistorialAlertas repositorio={{ getAll: vi.fn().mockResolvedValue(evaluadas) }} />)
    expect(await screen.findByText('4 alertas evaluadas')).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Fecha de evaluación' })).toBeTruthy()
    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(filas.map(fila => within(fila).getAllByRole('cell')[0].textContent)).toEqual(['Box 4', 'Box 1', 'Box 2', 'Box 5'])
  })

  it('muestra solo evaluadas y permite filtrar y consultar el detalle', async () => {
    const usuario = userEvent.setup()
    const repositorio = { getAll: vi.fn().mockResolvedValue(datos), actualizarEstadoEvaluacion: vi.fn() }
    render(<HistorialAlertas repositorio={repositorio} />)
    expect(await screen.findByText('2 alertas evaluadas')).toBeTruthy()
    expect(screen.getByText('21/10/2026 11:00')).toBeTruthy()
    expect(screen.getByText('No registrada')).toBeTruthy()
    expect(screen.queryByText('Box 3')).toBeNull()
    expect(screen.getByText('Mostrando 2 de 2 alertas evaluadas')).toBeTruthy()
    await usuario.selectOptions(screen.getByLabelText('Resultado de evaluación'), 'falso positivo')
    expect(screen.queryByText('Box 1')).toBeNull()
    expect(screen.getByText('Mostrando 1 de 2 alertas evaluadas')).toBeTruthy()
    await usuario.click(screen.getByText('Box 2'))
    const dialogo = screen.getByRole('dialog', { name: 'Detalle de alerta' })
    expect(within(dialogo).getByText('Vulneración de Derechos (VD)')).toBeTruthy()
    expect(within(dialogo).getByRole('button', { name: 'Ver transcripción' })).toBeTruthy()
  })

  it('informa cuando no hay alertas evaluadas', async () => {
    render(<HistorialAlertas repositorio={{ getAll: vi.fn().mockResolvedValue([datos[2]]) }} />)
    expect(await screen.findByText('No hay alertas evaluadas para mostrar.')).toBeTruthy()
  })

  it('permite reintentar después de un error', async () => {
    const usuario = userEvent.setup()
    const getAll = vi.fn().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(datos)
    render(<HistorialAlertas repositorio={{ getAll }} />)
    expect((await screen.findByRole('alert')).textContent).toContain('Sin conexión')
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('2 alertas evaluadas')).toBeTruthy()
  })
})
