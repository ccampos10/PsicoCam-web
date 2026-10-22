import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContextoSesion } from '../src/context/ContextoSesion'
import { ProveedorAccesibilidad } from '../src/context/Accesibilidad'
import { ProveedorNotificaciones } from '../src/context/Notificaciones'
import { ApiSettingsRepository } from '../src/repositories/ApiSettingsRepository'
import PaginaConfiguracion from '../src/pages/PaginaConfiguracion'

function mostrar(rol) {
  return render(<ContextoSesion.Provider value={{ usuario: { id: 7, rol } }}>
    <ProveedorAccesibilidad usuario={{ id: 7 }}><ProveedorNotificaciones usuario={{ id: 7, rol }}><PaginaConfiguracion titulo="Configuración" /></ProveedorNotificaciones></ProveedorAccesibilidad>
  </ContextoSesion.Provider>)
}

describe('Configuración por rol', () => {
  it('deja solo preferencias personales al supervisor y no consulta parámetros administrativos', () => {
    const obtener = vi.spyOn(ApiSettingsRepository.prototype, 'obtenerConfiguracion')
    mostrar('supervisor')
    expect(screen.getByRole('heading', { name: 'Accesibilidad visual' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Notificaciones' })).toBeTruthy()
    expect(screen.queryByText('Horario de operación')).toBeNull()
    expect(screen.queryByText('Notificaciones por correo')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull()
    expect(obtener).not.toHaveBeenCalled()
    obtener.mockRestore()
  })
  it('muestra las secciones administrativas al administrador', async () => {
    const obtener = vi.spyOn(ApiSettingsRepository.prototype, 'obtenerConfiguracion').mockResolvedValue({
      horaInicio: '08:00', horaTermino: '22:00', correoCliente: '', modoCorreo: 'asignado', incluirAdministradores: false,
    })
    mostrar('administrador')
    expect(await screen.findByRole('heading', { name: 'Horario de operación' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Notificaciones por correo' })).toBeTruthy()
    expect(obtener).toHaveBeenCalledTimes(1)
    obtener.mockRestore()
  })
})
