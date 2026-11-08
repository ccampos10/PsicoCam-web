import { IAlertaRepository } from './IAlertaRepository'
import { api } from '../services/api'

export class ApiAlertaRepository extends IAlertaRepository {
  actualizacionesEnVivo = true
  async getAll() {
    return api.listarAlertas()
  }

  async getById(id) {
    return api.obtenerAlerta(id)
  }

  async actualizarEstadoEvaluacion(id, estadoEvaluacion, notasClinicas) {
    return api.actualizarEvaluacion(id, estadoEvaluacion, notasClinicas)
  }
}
