import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContextoSesion } from '../src/context/ContextoSesion'
import MiCuenta from '../src/pages/MiCuenta'
import { api } from '../src/services/api'

describe('Mi cuenta', () => {
  it('muestra los datos y permite editar el perfil', async () => {
    const actualizarPerfil = vi.fn().mockResolvedValue({})
    render(<ContextoSesion.Provider value={{ usuario: { nombre: 'Ana Pérez', correo: 'ana@example.cl', rol: 'supervisor' }, actualizarPerfil }}><MiCuenta /></ContextoSesion.Provider>)
    expect(screen.getByRole('heading', { name: 'Mi cuenta' })).toBeTruthy()
    expect(screen.getByText('ana@example.cl')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    fireEvent.change(screen.getAllByLabelText('Contraseña actual')[0], { target: { value: 'anterior' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(actualizarPerfil).toHaveBeenCalledWith({ nombre: 'Ana Pérez', correo: 'ana@example.cl', passwordActual: 'anterior' }))
    expect(await screen.findByText('Perfil actualizado correctamente.')).toBeTruthy()
  })

  it('valida la confirmación y comunica el cambio de contraseña', async () => {
    const cambiar = vi.spyOn(api, 'cambiarContrasena').mockResolvedValue({})
    render(<ContextoSesion.Provider value={{ usuario: { nombre: 'Ana' } }}><MiCuenta /></ContextoSesion.Provider>)
    expect(screen.queryByLabelText('Nueva contraseña')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    fireEvent.change(screen.getByLabelText('Contraseña actual'), { target: { value: 'anterior' } })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'nuevaclave' } })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: 'distinta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(screen.getByText('Las contraseñas nuevas no coinciden.')).toBeTruthy()
    expect(cambiar).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: 'nuevaclave' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    expect(await screen.findByText('Contraseña actualizada correctamente.')).toBeTruthy()
    expect(cambiar).toHaveBeenCalledWith({ passwordActual: 'anterior', passwordNueva: 'nuevaclave' })
    cambiar.mockRestore()
  })

  it('solicita confirmación antes de cerrar la sesión', async () => {
    const cerrarSesion = vi.fn().mockResolvedValue(true)
    render(<ContextoSesion.Provider value={{ usuario: { nombre: 'Ana' }, cerrarSesion }}><MiCuenta /></ContextoSesion.Provider>)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(cerrarSesion).not.toHaveBeenCalled()
    const dialogo = screen.getByRole('dialog', { name: 'Cerrar sesión' })
    fireEvent.click(dialogo.querySelector('.button-primary'))
    await waitFor(() => expect(cerrarSesion).toHaveBeenCalledOnce())
  })
})
