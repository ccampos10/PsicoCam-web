import { IAlertaRepository } from './IAlertaRepository'
import { api } from '../services/api'

export class ApiAlertaRepository extends IAlertaRepository {
  async getAll() {
    return api.listarAlertas()
  }

  async getById(id) {
    return api.obtenerAlerta(id)
  }

  async actualizarEstadoEvaluacion(id, estadoEvaluacion) {
    return api.actualizarEvaluacion(id, estadoEvaluacion)
  }
}
