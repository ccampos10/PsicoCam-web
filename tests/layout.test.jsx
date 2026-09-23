import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { ProveedorSesion } from '../src/context/ProveedorSesion'
import RutasAplicacion from '../src/routes/RutasAplicacion'
import { navegacion } from '../src/routes/navegacion'

const usuario = { nombre: 'Persona de prueba', rol: 'Supervisor', rutasPermitidas: navegacion.map(opcion => opcion.ruta) }

function ControlesHistorial() {
  const navegar = useNavigate()
  return <button onClick={() => navegar(-1)}>Atrás de prueba</button>
}
function prepararPrueba({ rutaInicial = '/dashboard', sesion = usuario, alCerrarSesion } = {}) {
  render(<MemoryRouter initialEntries={[rutaInicial]}><ProveedorSesion usuarioInicial={sesion} alCerrarSesion={alCerrarSesion}>
    <RutasAplicacion /><ControlesHistorial />
  </ProveedorSesion></MemoryRouter>)
  return userEvent.setup()
}

describe('Integración de SCRUM-27', () => {
  it('redirige sin sesión y no expone la estructura interna', async () => {
    prepararPrueba({ sesion: null, rutaInicial: '/historial' })
    expect(await screen.findByRole('heading', { name: 'Acceso a PsicoCam' })).toBeTruthy()
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('muestra cada ruta, actualiza el enlace activo y conserva los nodos del Layout', async () => {
    const interaccion = await prepararPrueba()
    const encabezado = screen.getByRole('banner')
    const barraLateral = screen.getByRole('complementary')
    for (const { titulo } of navegacion) {
      await interaccion.click(within(barraLateral).getByRole('link', { name: titulo }))
      expect(await screen.findByRole('heading', { level: 1, name: titulo })).toBeTruthy()
      expect(within(barraLateral).getByRole('link', { name: titulo }).getAttribute('aria-current')).toBe('page')
      expect(barraLateral.querySelectorAll('[aria-current="page"]').length).toBe(1)
      expect(screen.getByRole('banner')).toBe(encabezado)
      expect(screen.getByRole('complementary')).toBe(barraLateral)
    }
    await interaccion.click(screen.getByRole('button', { name: 'Atrás de prueba' }))
    expect(await screen.findByRole('heading', { name: 'Configuración' })).toBeTruthy()
  })

  it.each(navegacion)('permite entrar directamente a $ruta', async ({ ruta, titulo }) => {
    prepararPrueba({ rutaInicial: ruta })
    expect(await screen.findByRole('heading', { level: 1, name: titulo })).toBeTruthy()
  })

  it('redirige la ruta inicial y permite navegar a Alertas', async () => {
    const interaccion = await prepararPrueba({ rutaInicial: '/' })
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy()
    await interaccion.click(screen.getByRole('link', { name: 'Alertas', exact: true }))
    expect(await screen.findByRole('heading', { name: 'Alertas' })).toBeTruthy()
  })

  it('muestra la página no encontrada dentro del Layout y permite volver', async () => {
    const interaccion = await prepararPrueba({ rutaInicial: '/no-existe' })
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy()
    await interaccion.click(screen.getByRole('link', { name: 'Volver al inicio' }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy()
  })

  it('deniega rutas sin permiso y oculta sus enlaces también en el panel de usuario', async () => {
    const interaccion = await prepararPrueba({ rutaInicial: '/configuracion', sesion: { ...usuario, rutasPermitidas: ['/dashboard'] } })
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Configuración' })).toBeNull()
    await interaccion.click(screen.getByRole('button', { name: /Menú de usuario/ }))
    expect(screen.queryByRole('link', { name: 'Configuración' })).toBeNull()
    expect(screen.getAllByText('Persona de prueba').length).toBeGreaterThan(0)
  })

  it('abre notificaciones, cierra con Escape y permite navegar desde el panel', async () => {
    const interaccion = await prepararPrueba()
    const botonNotificaciones = screen.getByRole('button', { name: 'Notificaciones', exact: true })
    await interaccion.click(botonNotificaciones)
    expect(botonNotificaciones.getAttribute('aria-expanded')).toBe('true')
    await interaccion.keyboard('{Escape}')
    expect(botonNotificaciones.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(botonNotificaciones)
    await interaccion.click(botonNotificaciones)
    await interaccion.click(screen.getByRole('link', { name: 'Ver alertas' }))
    expect(await screen.findByRole('heading', { name: 'Alertas', level: 1 })).toBeTruthy()
    expect(botonNotificaciones.getAttribute('aria-expanded')).toBe('false')
  })

  it('cierra el menú móvil al navegar o cancelar el diálogo', async () => {
    const interaccion = await prepararPrueba()
    const alternar = screen.getByRole('button', { name: 'Abrir menú' })
    await interaccion.click(alternar)
    const dialogo = screen.getByRole('dialog', { name: 'Menú de navegación' })
    expect(document.body.style.overflow).toBe('hidden')
    await interaccion.click(within(dialogo).getByRole('link', { name: 'Historial' }))
    expect(await screen.findByRole('heading', { name: 'Historial' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    await interaccion.click(alternar)
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('permite cancelar el cierre, cerrar la sesión y bloquear el acceso desde el historial', async () => {
    const alCerrarSesion = vi.fn()
    const interaccion = await prepararPrueba({ alCerrarSesion })
    await interaccion.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await interaccion.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(alCerrarSesion).not.toHaveBeenCalled()
    await interaccion.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await interaccion.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Acceso a PsicoCam' })).toBeTruthy()
    expect(alCerrarSesion).toHaveBeenCalledTimes(1)
    await interaccion.click(screen.getByRole('button', { name: 'Atrás de prueba' }))
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('conserva la sesión y permite reintentar cuando falla el cierre remoto', async () => {
    const interaccion = await prepararPrueba({ alCerrarSesion: vi.fn().mockRejectedValue(new Error('sin conexión')) })
    await interaccion.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await interaccion.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('banner')).toBeTruthy()
  })
})
