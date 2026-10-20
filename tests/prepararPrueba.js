import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import alertas from '../src/services/mockData.json'

afterEach(() => cleanup())
window.scrollTo = vi.fn()
window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
// jsdom no implementa ResizeObserver; Recharts lo usa para medir sus contenedores.
class ObservadorResize {
  constructor(notificar) { this.notificar = notificar }
  observe() {
    this.notificar([{ contentRect: { width: 640, height: 240 }, borderBoxSize: [{ inlineSize: 640, blockSize: 240 }] }])
  }
  unobserve() { }
  disconnect() { }
}
window.ResizeObserver = window.ResizeObserver ?? ObservadorResize
// jsdom no implementa el diálogo ni la contención del foco del navegador.
// Estas pruebas verifican las interacciones; el foco nativo y el diseño adaptable
// requieren verificación en un navegador real.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }

const bitacora = [
  { id: '1', fecha: '2026-09-24', hora: '11:18', usuario: 'Sistema', nivel: 'Informacion', detalle: 'Inicio del servicio', alertaId: null },
]
const configuracion = {
  horaOperacion: { hora_inicio: '08:00', hora_termino: '22:00' },
  contactoRespaldo: { correo: 'contacto@psicocam.cl' },
}

globalThis.fetch = vi.fn(async (ruta) => {
  const url = String(ruta)
  if (url.includes('/api/alertas')) return new Response(JSON.stringify(alertas), { status: 200 })
  if (url.includes('/api/bitacora')) return new Response(JSON.stringify(bitacora), { status: 200 })
  if (url.includes('/api/configuracion')) return new Response(JSON.stringify(configuracion), { status: 200 })
  if (url.includes('/api/usuarios')) return new Response(JSON.stringify([]), { status: 200 })
  return new Response(JSON.stringify({ error: 'Ruta de prueba no configurada.' }), { status: 404 })
})
