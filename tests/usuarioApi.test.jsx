import { describe, expect, it, vi } from 'vitest'
import { ApiUsuarioRepository } from '../src/repositories/ApiUsuarioRepository'

describe('Repositorio de usuarios conectado a la API', () => {
  it('envía roles, estado y contraseña con el contrato del backend', async () => {
    const anterior = globalThis.fetch
    const fetchPrueba = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      id: 3, nombre: 'Ana', correo: 'ana@example.cl', rol: 'supervisor', esta_activo: true,
    }), { status: 200 }))
    globalThis.fetch = fetchPrueba
    try {
      const repo = new ApiUsuarioRepository()
      expect(repo.soportaGestionCompleta).toBe(true)
      const creado = await repo.crearUsuario({ nombre: 'Ana', correo: 'ana@example.cl', contrasena: 'clave123', rol: 'Supervisor', estado: 'Activo' })
      expect(creado.rol).toBe('Supervisor')
      expect(fetchPrueba.mock.calls[0][0]).toBe('/api/usuarios')
      expect(fetchPrueba.mock.calls[0][1].method).toBe('POST')
      expect(JSON.parse(fetchPrueba.mock.calls[0][1].body)).toEqual({ nombre: 'Ana', correo: 'ana@example.cl', password: 'clave123', rol: 'supervisor', esta_activo: true })
      await repo.actualizarUsuario(3, { rol: 'Administrador', estado: 'Inactivo' })
      expect(fetchPrueba.mock.calls[1][0]).toBe('/api/usuarios/3')
      expect(JSON.parse(fetchPrueba.mock.calls[1][1].body)).toEqual({ rol: 'administrador', esta_activo: false })
      await repo.cambiarEstadoUsuario(3, 'Activo')
      expect(JSON.parse(fetchPrueba.mock.calls[2][1].body)).toEqual({ esta_activo: true })
      await repo.eliminarUsuario(3)
      expect(fetchPrueba.mock.calls[3][1].method).toBe('DELETE')
    } finally {
      globalThis.fetch = anterior
    }
  })
})
