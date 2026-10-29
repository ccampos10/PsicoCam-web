export class RegistroBitacora {
  nivel: "Información" | "Advertencia" | "Grave";
  descripcion: String;
  alerta: String | null;
  fecha: String;
  hora: String;
  usuario: String;

  constructor(
    nivel: "Información" | "Advertencia" | "Grave",
    descripcion: String,
    alerta: String | null,
    fecha: String,
    hora: String,
    usuario: String
  ) {
    this.nivel = nivel;
    this.descripcion = descripcion;
    this.alerta = alerta;
    this.fecha = fecha;
    this.hora = hora;
    this.usuario = usuario;
  }

  get fechaHora(): String {
    return `${this.fecha} ${this.hora}`;
  }
}

export interface IBitacoraRepository {
  ObtenerRegistros(): Promise<RegistroBitacora[]>
  RegistroPorId(id: String): Promise<RegistroBitacora | null>
}
