import { IBitacoraRepository, RegistroBitacora } from '../services/IBitacoraRepository'
import { api } from '../services/api'

function adaptarRegistro(registro: Record<string, unknown>) {
  return Object.assign(new RegistroBitacora(
    String(registro.nivel || ''),
    String(registro.detalle || ''),
    registro.alertaId ? String(registro.alertaId) : null,
    String(registro.fecha || ''),
    String(registro.hora || ''),
    String(registro.usuario || ''),
  ), { id: registro.id, alertaId: registro.alertaId })
}

export class ApiBitacoraRepository implements IBitacoraRepository {
  async ObtenerRegistros() {
    const registros = await api.listarBitacora()
    return registros.map(adaptarRegistro)
  }

  async RegistroPorId(id: String) {
    return (await this.ObtenerRegistros()).find((registro) => String((registro as { id?: unknown }).id) === String(id)) || null
  }

  listarRegistros() {
    return this.ObtenerRegistros()
  }
}
