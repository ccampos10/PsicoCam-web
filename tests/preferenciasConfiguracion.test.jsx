import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PreferenciasConfiguracion from '../src/components/PreferenciasConfiguracion'
import { ProveedorAccesibilidad } from '../src/context/Accesibilidad'
import { ProveedorNotificaciones } from '../src/context/Notificaciones'

function montar(id = 'prueba') {
  return render(<ProveedorAccesibilidad usuario={{ id }}><ProveedorNotificaciones usuario={{ id }}><PreferenciasConfiguracion /><div>Otra página</div></ProveedorNotificaciones></ProveedorAccesibilidad>)
}

describe('Preferencias de configuración', () => {
  beforeEach(() => localStorage.clear())
  it('aplica todas las preferencias a la raíz y las recupera al volver a cargar', async () => {
    const usuario = userEvent.setup()
    const vista = montar()
    await usuario.selectOptions(screen.getByLabelText(/Tamaño de texto/), 'grande')
    await usuario.selectOptions(screen.getByLabelText(/Contraste de interfaz/), 'alto')
    await usuario.selectOptions(screen.getByLabelText(/Modo daltonismo/), 'protanopia')
    await usuario.selectOptions(screen.getByLabelText(/Identificar riesgo/), 'texto')
    expect(document.documentElement.style.zoom).toBe('1.15')
    expect(document.documentElement.dataset.contraste).toBe('alto')
    expect(document.documentElement.dataset.paleta).toBe('protanopia')
    expect(document.documentElement.dataset.indicador).toBe('texto')
    vista.unmount()
    montar()
    expect(screen.getByLabelText(/Tamaño de texto/).value).toBe('grande')
    expect(screen.getByLabelText(/Modo daltonismo/).value).toBe('protanopia')
    expect(document.documentElement.dataset.indicador).toBe('texto')
  })
  it('mantiene las preferencias separadas por usuario', async () => {
    const usuario = userEvent.setup()
    const vista = montar('primero')
    await usuario.selectOptions(screen.getByLabelText(/Tamaño de texto/), 'mayor')
    vista.unmount()
    montar('segundo')
    expect(screen.getByLabelText(/Tamaño de texto/).value).toBe('normal')
  })
  it('permite seleccionar todos los modos en toda la interfaz', async () => {
    const usuario = userEvent.setup()
    montar()
    const selector = screen.getByLabelText(/Modo daltonismo/)
    for (const modo of ['protanopia', 'deuteranopia', 'tritanopia', 'monocromatico', 'predeterminada']) {
      await usuario.selectOptions(selector, modo)
      expect(document.documentElement.dataset.paleta).toBe(modo)
      expect(JSON.parse(localStorage.getItem('psicocam_accesibilidad_prueba')).paleta).toBe(modo)
    }
  })
  it('recupera la paleta alternativa de versiones anteriores', () => {
    localStorage.setItem('psicocam_accesibilidad_prueba', JSON.stringify({ paleta: 'alternativa' }))
    montar()
    expect(screen.getByLabelText(/Modo daltonismo/).value).toBe('protanopia')
  })
  it('no presenta un interruptor para avisos clínicos obligatorios', () => {
    montar()
    expect(screen.queryByText('Avisos clínicos críticos')).toBeNull()
    expect(screen.getByRole('switch', { name: 'Sonidos de alerta' }).disabled).toBe(false)
  })
  it('guarda las preferencias de notificaciones al cambiar los interruptores', async () => {
    const interaccion = userEvent.setup()
    const vista = montar()
    const sonido = screen.getByRole('switch', { name: 'Sonidos de alerta' })
    expect(sonido.checked).toBe(false)
    await interaccion.click(sonido)
    expect(screen.getByRole('button', { name: 'Probar sonido' })).toBeTruthy()
    await interaccion.click(screen.getByRole('switch', { name: 'Resumen de notificaciones' }))
    vista.unmount()
    montar()
    expect(screen.getByRole('switch', { name: 'Sonidos de alerta' }).checked).toBe(true)
    expect(screen.getByRole('switch', { name: 'Resumen de notificaciones' }).checked).toBe(false)
  })
})
