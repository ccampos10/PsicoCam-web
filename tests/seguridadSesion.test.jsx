import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProveedorSesion } from '../src/context/ProveedorSesion'
import RutasAplicacion from '../src/routes/RutasAplicacion'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

describe('Autorizacion de sesion', () => {
  it('ignora un rol administrador falsificado en localStorage y usa el perfil del backend', async () => {
    localStorage.setItem('psicocam_usuario', JSON.stringify({
      id: 99, nombre: 'Perfil falsificado', correo: 'atacante@example.cl', rol: 'administrador',
    }))
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      id: 2, nombre: 'Supervisor real', correo: 'supervisor@example.cl', rol: 'supervisor', esta_activo: true,
    }), { status: 200 }))

    render(<MemoryRouter initialEntries={['/usuarios']}>
      <ProveedorSesion><RutasAplicacion /></ProveedorSesion>
    </MemoryRouter>)

    expect(await screen.findByRole('heading', { name: 'Acceso restringido' })).toBeTruthy()
    expect(localStorage.getItem('psicocam_usuario')).toBeNull()
    expect(sessionStorage.getItem('psicocam_usuario')).toBeNull()
  })
})
