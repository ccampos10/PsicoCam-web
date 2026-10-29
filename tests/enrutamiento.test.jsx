import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router-dom'
import { ProveedorSesion } from '../src/context/ProveedorSesion'
import RutasAplicacion from '../src/routes/RutasAplicacion'
import { mapaRutas, rutasInternas } from '../src/routes/mapaRutas'

const usuario = {
  nombre: 'Persona de prueba', rol: 'Supervisor',
  rutasPermitidas: rutasInternas.map(opcion => opcion.ruta),
}

function prepararPrueba(rutaInicial, sesion = usuario) {
  render(<MemoryRouter initialEntries={[rutaInicial]}>
    <ProveedorSesion usuarioInicial={sesion}>
      <RutasAplicacion />
      <Link to="/alertas/AL-123">Abrir detalle de prueba</Link>
    </ProveedorSesion>
  </MemoryRouter>)
  return userEvent.setup()
}

describe('Enrutamiento principal: SCRUM-222 a SCRUM-225', () => {
  it('mantiene el acceso fuera del Layout y permite entrar al historial', async () => {
    const interaccion = prepararPrueba('/historial', null)
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.queryByRole('banner')).toBeNull()
    await interaccion.click(screen.getByText('Vista previa de desarrollo'))
    await interaccion.click(screen.getByRole('button', { name: 'Abrir vista previa' }))
    expect(await screen.findByRole('heading', { name: 'Historial de Alertas' })).toBeTruthy()
    expect(screen.getByRole('banner')).toBeTruthy()
  })

  it('resuelve el parámetro del detalle desde una URL directa', () => {
    prepararPrueba('/alertas/AL-456')
    expect(screen.getByRole('heading', { name: 'Detalle de alerta' })).toBeTruthy()
    expect(screen.getByText('Identificador de alerta: AL-456')).toBeTruthy()
    const barraLateral = screen.getByRole('complementary')
    expect(within(barraLateral).getByRole('link', { name: 'Alertas' }).getAttribute('aria-current')).toBe('page')
    expect(within(barraLateral).queryByRole('link', { name: 'Detalle de alerta' })).toBeNull()
  })

  it('navega del historial al detalle sin reconstruir el Layout', async () => {
    const interaccion = prepararPrueba('/historial')
    const encabezado = screen.getByRole('banner')
    const barraLateral = screen.getByRole('complementary')
    await interaccion.click(screen.getByRole('link', { name: 'Abrir detalle de prueba' }))
    expect(await screen.findByRole('heading', { name: 'Detalle de alerta' })).toBeTruthy()
    expect(screen.getByRole('banner')).toBe(encabezado)
    expect(screen.getByRole('complementary')).toBe(barraLateral)
  })

  it('recupera el detalle solicitado después de abrir la vista previa', async () => {
    const interaccion = prepararPrueba('/alertas/AL-789?origen=historial', null)
    expect(screen.queryByRole('heading', { name: 'Detalle de alerta' })).toBeNull()
    await interaccion.click(screen.getByText('Vista previa de desarrollo'))
    await interaccion.click(screen.getByRole('button', { name: 'Abrir vista previa' }))
    expect(await screen.findByText('Identificador de alerta: AL-789')).toBeTruthy()
  })

  it('exige el permiso del detalle y no lo deduce del acceso al listado', () => {
    prepararPrueba('/alertas/AL-123', { ...usuario, rutasPermitidas: ['/alertas', '/historial'] })
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeTruthy()
    expect(screen.queryByText('Identificador de alerta: AL-123')).toBeNull()
  })

  it('rechaza destinos externos recibidos en el estado de navegación', async () => {
    prepararPrueba({ pathname: '/login', state: { rutaSolicitada: 'https://ejemplo.com' } })
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy()
  })

  it('no interpreta segmentos adicionales como un detalle válido', () => {
    prepararPrueba('/alertas/AL-123/no-existe')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy()
  })

  it('registra una sola ruta por destino y conserva el patrón dinámico', () => {
    const rutas = Object.values(mapaRutas).map(opcion => opcion.ruta)
    expect(new Set(rutas).size).toBe(rutas.length)
    expect(mapaRutas.detalleAlerta.ruta).toBe('/alertas/:idAlerta')
  })
})
