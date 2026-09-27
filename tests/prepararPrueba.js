import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

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
