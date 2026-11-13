import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProveedorSesion } from '../src/context/ProveedorSesion'
import RutasAplicacion from '../src/routes/RutasAplicacion'
import { api } from '../src/services/api'

const usuario = { nombre: 'Persona de prueba', rol: 'Supervisor' }

afterEach(() => { vi.restoreAllMocks() })

describe('Sesión expirada', () => {
  it('limpia la sesión y redirige al login ante un 401 de la API', async () => {
    sessionStorage.setItem('psicocam_token', 'token-expirado')
    sessionStorage.setItem('psicocam_usuario', JSON.stringify(usuario))
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 }),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProveedorSesion usuarioInicial={usuario}>
          <button type="button" onClick={() => api.listarAlertas().catch(() => {})}>
            Simular petición protegida
          </button>
          <RutasAplicacion />
        </ProveedorSesion>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Simular petición protegida' }))
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(await screen.findByText('Tu sesión ha expirado. Inicia sesión nuevamente.')).toBeTruthy()
    expect(sessionStorage.getItem('psicocam_token')).toBeNull()
    expect(sessionStorage.getItem('psicocam_usuario')).toBeNull()
    expect(localStorage.getItem('psicocam_token')).toBeNull()
    expect(localStorage.getItem('psicocam_usuario')).toBeNull()
  })
})
