import type { ISettingsRepository } from '../services/ISettingsRepository'
import { api } from '../services/api'

export class ApiSettingsRepository implements ISettingsRepository {
  async ObtenerConfiguracion() {
    const configuracion = await api.obtenerConfiguracion()
    return {
      horaInicio: configuracion.horaInicio,
      horaTermino: configuracion.horaTermino,
      correo: configuracion.correoCliente,
    }
  }

  async CambiarHora(horaInicio: string, horaTermino: string) {
    const configuracion = await this.ObtenerConfiguracion()
    await api.actualizarConfiguracion({
      horaInicio,
      horaTermino,
      correoCliente: configuracion.correo,
    })
    return null
  }

  async CambiarCorreo(correo: string) {
    const configuracion = await this.ObtenerConfiguracion()
    await api.actualizarConfiguracion({
      horaInicio: configuracion.horaInicio,
      horaTermino: configuracion.horaTermino,
      correoCliente: correo,
    })
    return null
  }

  async obtenerConfiguracion() {
    const configuracion = await this.ObtenerConfiguracion()
    return { ...configuracion, correoCliente: configuracion.correo }
  }

  async actualizarConfiguracion(configuracion: { horaInicio: string, horaTermino: string, correoCliente: string }) {
    return api.actualizarConfiguracion(configuracion)
  }
}
