import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProveedorSesion } from '../src/context/ProveedorSesion'
import RutasAplicacion from '../src/routes/RutasAplicacion'
import { rutasInternas, mapaRutas } from '../src/routes/mapaRutas'
import Dashboard from '../src/pages/Dashboard'
import { colorNivel } from '../src/utils/coloresSemafaro'

const usuario = {
  nombre: 'Persona de prueba',
  rol: 'Supervisor',
  rutasPermitidas: rutasInternas.map(opcion => opcion.ruta),
}

function renderizarConRuta(rutaInicial, sesion = usuario) {
  render(<MemoryRouter initialEntries={[rutaInicial]}>
    <ProveedorSesion usuarioInicial={sesion}><RutasAplicacion /></ProveedorSesion>
  </MemoryRouter>)
}

describe('Dashboard: SCRUM-221', () => {
  it('mapea los colores de semáforo a los niveles de riesgo', () => {
    expect(colorNivel).toEqual({ Bajo: '#44c58a', Medio: '#f2c94c', Alto: '#d9534f' })
  })

  it('maqueta la cabecera con el estado de monitoreo activo', () => {
    renderizarConRuta('/dashboard')
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy()
    expect(screen.getByText('Visión general del estado de alertas y monitoreo de los boxes clínicos.')).toBeTruthy()
    expect(screen.getByText('Monitoreo activo')).toBeTruthy()
  })

  it('muestra las métricas globales en el grid principal', async () => {
    renderizarConRuta('/dashboard')
    const metricas = await screen.findByRole('region', { name: 'Métricas principales' })
    expect(within(metricas).getByText('Alertas registradas')).toBeTruthy()
    expect(within(metricas).getByText('15')).toBeTruthy()
    expect(within(metricas).getByText('Pendientes')).toBeTruthy()
    expect(within(metricas).getByText('5')).toBeTruthy()
    expect(within(metricas).getByText('Evaluadas')).toBeTruthy()
    expect(within(metricas).getByText('10')).toBeTruthy()
    expect(within(metricas).getByText('Riesgo alto')).toBeTruthy()
    expect(within(metricas).getByText('6')).toBeTruthy()
    expect(within(metricas).getByText('Promedio por supervisor')).toBeTruthy()
    expect(within(metricas).getByText('3')).toBeTruthy()
  })

  it('define los contenedores de gráficos con su distribución por nivel de riesgo', async () => {
    renderizarConRuta('/dashboard')
    const grafico = await screen.findByRole('region', { name: 'Distribución por nivel de riesgo' })
    expect(screen.getByRole('heading', { name: 'Distribución por nivel de riesgo' })).toBeTruthy()
    expect(within(grafico).getByRole('img', { name: /Bajo: 4, Medio: 5, Alto: 6/ })).toBeTruthy()
    for (const nivel of ['Bajo', 'Medio', 'Alto']) {
      expect(await within(grafico).findByText(nivel)).toBeTruthy()
    }
    await waitFor(() => {
      const colores = [...grafico.querySelectorAll('path')]
        .map(nodo => nodo.getAttribute('fill'))
        .filter(relleno => /^#[0-9A-Fa-f]{6}$/.test(relleno || ''))
      expect(new Set(colores)).toEqual(new Set(Object.values(colorNivel)))
    })
  })

  it('define el contenedor de detecciones con sus barras de progreso', async () => {
    renderizarConRuta('/dashboard')
    const panel = await screen.findByRole('region', { name: 'Alertas por tipo de detección' })
    expect(screen.getByRole('heading', { name: 'Alertas por tipo de detección' })).toBeTruthy()
    expect(within(panel).getByText(/Riesgo Suicida/)).toBeTruthy()
    expect(within(panel).getByText('8 alertas')).toBeTruthy()
    expect(within(panel).getByText(/Vulneración de Derechos/)).toBeTruthy()
    expect(within(panel).getByText('7 alertas')).toBeTruthy()
  })

  it('lista los boxes clínicos en monitoreo', async () => {
    renderizarConRuta('/dashboard')
    const panel = await screen.findByRole('region', { name: 'Boxes clínicos' })
    expect(within(panel).getByText('5 boxes designados para monitoreo')).toBeTruthy()
    for (const nombre of ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5']) {
      expect(within(panel).getByText(nombre)).toBeTruthy()
    }
    expect(within(panel).getAllByText('Monitoreando')).toHaveLength(5)
  })

  it('muestra las alertas recientes con su nivel de riesgo', async () => {
    renderizarConRuta('/dashboard')
    const panel = await screen.findByRole('region', { name: 'Alertas recientes' })
    expect(within(panel).getByText('Box 5')).toBeTruthy()
    expect(within(panel).getByText('Riesgo alto')).toBeTruthy()
    expect(within(panel).getByText('17:05')).toBeTruthy()
    expect(within(panel).getByText('Riesgo medio')).toBeTruthy()
    expect(within(panel).getByText('Riesgo bajo')).toBeTruthy()
  })

  it('se integra al enrutamiento como destino alcanzable desde el Layout', async () => {
    renderizarConRuta('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy()
    expect(screen.getByRole('complementary')).toBeTruthy()
  })

  it('exige sesión para acceder a la vista', () => {
    renderizarConRuta('/dashboard', null)
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.queryByText('Alertas registradas')).toBeNull()
  })

  it('es la página componente del módulo definida en el mapa de rutas', () => {
    expect(mapaRutas.dashboard.componente).toBe(Dashboard)
    expect(mapaRutas.dashboard.ruta).toBe('/dashboard')
  })
})