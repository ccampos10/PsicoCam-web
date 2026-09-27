export interface ISettingsRepository {
    ObtenerConfiguracion(): {horaInicio: String, horaTermino: String, correo: String}
    CambiarHora(horaInicio: String, horaTermino: String): null
    CambiarCorreo(correo: String): null
}