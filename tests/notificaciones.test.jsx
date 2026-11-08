import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ProveedorNotificaciones } from '../src/context/Notificaciones'
import { useNotificaciones } from '../src/hooks/useNotificaciones'
import { api } from '../src/services/api'
import Navbar from '../src/components/Navbar'
import { MemoryRouter } from 'react-router-dom'
import { ContextoSesion } from '../src/context/ContextoSesion'

function Vista() {
  const { preferencias, cambiarPreferencia, pendientes, estado, probarSonido } = useNotificaciones()
  return <><p data-testid="estado">{estado}</p><p data-testid="pendientes">{pendientes.map(a => a.id).join(',')}</p>
    <button onClick={() => cambiarPreferencia('pantalla', !preferencias.pantalla)}>Cambiar pantalla</button>
    <button onClick={() => cambiarPreferencia('sonido', !preferencias.sonido)}>Cambiar sonido</button>
    <button onClick={probarSonido}>Probar sonido</button>
    <p data-testid="preferencias">{JSON.stringify(preferencias)}</p>
  </>
}
const alerta = (id, supervisor = 'ana@example.cl') => ({ id, supervisor, box: 'Box 1', categoria: 'RS', nivel: 'Alto', estado_evaluacion: 'neutro' })

describe('Notificaciones de alertas', () => {
  beforeEach(() => { vi.useFakeTimers(); localStorage.clear() })
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })
  it('detecta nuevas alertas propias sin notificar alertas históricas ni de otro supervisor', async () => {
    const listar = vi.spyOn(api, 'listarAlertas').mockResolvedValueOnce([alerta('vieja')])
      .mockResolvedValueOnce([alerta('vieja'), alerta('nueva'), alerta('ajena', 'otro@example.cl')])
      .mockResolvedValueOnce([alerta('vieja'), alerta('nueva'), alerta('ajena', 'otro@example.cl')])
    await act(async () => { render(<ProveedorNotificaciones usuario={{ id: 1, correo: 'ana@example.cl', rol: 'supervisor' }}><Vista /></ProveedorNotificaciones>) })
    expect(screen.queryByRole('status')).toBeNull()
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(screen.getByRole('status').textContent).toContain('una nueva alerta')
    expect(screen.getByTestId('pendientes').textContent).toBe('vieja,nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso de alerta' }))
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(screen.queryByRole('status')).toBeNull()
    expect(listar).toHaveBeenCalledTimes(3)
  })
  it('oculta avisos desactivados, conserva preferencias y muestra errores de conexión', async () => {
    vi.spyOn(api, 'listarAlertas').mockResolvedValueOnce([]).mockResolvedValueOnce([alerta('nueva')]).mockRejectedValueOnce(new Error('sin conexión'))
    const vista = render(<ProveedorNotificaciones usuario={{ id: 2, rol: 'administrador' }}><Vista /></ProveedorNotificaciones>)
    await act(async () => {})
    fireEvent.click(screen.getByText('Cambiar pantalla'))
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByTestId('pendientes').textContent).toBe('nueva')
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(screen.getByTestId('estado').textContent).toBe('error')
    vista.unmount()
    render(<ProveedorNotificaciones usuario={{ id: 2, rol: 'administrador' }}><Vista /></ProveedorNotificaciones>)
    expect(JSON.parse(screen.getByTestId('preferencias').textContent).pantalla).toBe(false)
  })
  it('reproduce el tono solo con sonido habilitado al detectar una alerta nueva', async () => {
    const iniciar = vi.fn()
    const detener = vi.fn()
    const ajustarVolumen = vi.fn()
    const cerrar = vi.fn().mockResolvedValue()
    const contexto = { state: 'running', currentTime: 0, destination: {}, close: cerrar,
      createOscillator: () => ({ frequency: {}, connect: vi.fn(), start: iniciar, stop: detener }),
      createGain: () => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: ajustarVolumen }, connect: vi.fn() }) }
    vi.stubGlobal('AudioContext', vi.fn(function () { return contexto }))
    vi.spyOn(api, 'listarAlertas').mockResolvedValueOnce([]).mockResolvedValueOnce([alerta('nueva')])
    render(<ProveedorNotificaciones usuario={{ id: 3, rol: 'administrador' }}><Vista /></ProveedorNotificaciones>)
    await act(async () => {})
    fireEvent.click(screen.getByText('Cambiar sonido'))
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(iniciar).toHaveBeenCalledTimes(3)
    expect(iniciar).toHaveBeenNthCalledWith(1, 0)
    expect(iniciar).toHaveBeenNthCalledWith(2, 0.22)
    expect(iniciar).toHaveBeenNthCalledWith(3, 0.44)
    expect(detener).toHaveBeenNthCalledWith(3, 0.70)
    expect(ajustarVolumen).toHaveBeenCalledWith(0.28, 0.035)
    vi.unstubAllGlobals()
  })
  it('permite marcar las alertas como leídas sin cambiar su evaluación y conserva la lectura en este navegador', async () => {
    vi.spyOn(api, 'listarAlertas').mockResolvedValue([alerta('1'), alerta('2')])
    const usuario = { id: 4, nombre: 'Administrador', rol: 'administrador', rutasPermitidas: ['/alertas'] }
    const pantalla = () => <MemoryRouter><ContextoSesion.Provider value={{ usuario }}><ProveedorNotificaciones usuario={usuario}><Navbar /></ProveedorNotificaciones></ContextoSesion.Provider></MemoryRouter>
    const vista = render(pantalla())
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }))
    expect(screen.getByLabelText('2 sin leer')).toBeTruthy()
    expect(screen.getAllByText('Box 1')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }))
    expect(screen.queryByLabelText('2 sin leer')).toBeNull()
    expect(api.listarAlertas).toHaveBeenCalledTimes(1)
    vista.unmount()
    render(pantalla())
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }))
    expect(screen.getAllByText('Box 1')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Marcar todas como leídas' })).toBeNull()
  })
})
