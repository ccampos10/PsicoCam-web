import type { ISettingsRepository } from '../services/ISettingsRepository'
import { api } from '../services/api'

export class ApiSettingsRepository implements ISettingsRepository {
  async ObtenerConfiguracion() {
    const configuracion = await api.obtenerConfiguracion()
    return {
      horaInicio: configuracion.horaInicio,
      horaTermino: configuracion.horaTermino,
      correo: configuracion.correoCliente,
      modoCorreo: configuracion.modoCorreo,
      incluirAdministradores: configuracion.incluirAdministradores,
    }
  }

  async CambiarHora(horaInicio: string, horaTermino: string) {
    const configuracion = await this.ObtenerConfiguracion()
    await api.actualizarConfiguracion({
      horaInicio,
      horaTermino,
      correoCliente: configuracion.correo,
      modoCorreo: configuracion.modoCorreo,
      incluirAdministradores: configuracion.incluirAdministradores,
    })
    return null
  }

  async CambiarCorreo(correo: string) {
    const configuracion = await this.ObtenerConfiguracion()
    await api.actualizarConfiguracion({
      horaInicio: configuracion.horaInicio,
      horaTermino: configuracion.horaTermino,
      correoCliente: correo,
      modoCorreo: configuracion.modoCorreo,
      incluirAdministradores: configuracion.incluirAdministradores,
    })
    return null
  }

  async obtenerConfiguracion() {
    const configuracion = await this.ObtenerConfiguracion()
    return { ...configuracion, correoCliente: configuracion.correo }
  }

  async actualizarConfiguracion(configuracion: { horaInicio: string, horaTermino: string, correoCliente: string, modoCorreo: string, incluirAdministradores: boolean }) {
    return api.actualizarConfiguracion(configuracion)
  }
}
