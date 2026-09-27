import { IBitacoraRepository, RegistroBitacora } from "./IBitacoraRepository"

export default class BitacoraRepository implements IBitacoraRepository {
  ObtenerRegistros(): RegistroBitacora[] {
    return [
      new RegistroBitacora(
        "Información",
        "Esta es una descripcion",
        null,
        "24/09/2026",
        "11:18",
        "Sistema",
      ),
      new RegistroBitacora(
        "Advertencia",
        "Esta es una descripcion segunda",
        null,
        "24/09/2026",
        "11:18",
        "Sistema",
      ),
      new RegistroBitacora(
        "Grave",
        "Esta es una descripcion tercera",
        null,
        "24/09/2026",
        "11:18",
        "Sistema",
      ),
      new RegistroBitacora(
        "Información",
        "Esta es una descripcion",
        "ID..",
        "24/09/2026",
        "11:18",
        "Juan",
      ),
      new RegistroBitacora(
        "Advertencia",
        "Esta es una descripcion segunda",
        "ID..",
        "24/09/2026",
        "11:18",
        "Roberto",
      ),
      new RegistroBitacora(
        "Grave",
        "Esta es una descripcion tercera",
        "ID..",
        "24/09/2026",
        "11:18",
        "Carlos",
      ),
    ]
  }
  RegistroPorId(id: String): RegistroBitacora | null {
    return null
  }
}