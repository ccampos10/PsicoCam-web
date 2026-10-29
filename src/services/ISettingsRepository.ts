export interface ISettingsRepository {
    ObtenerConfiguracion(): Promise<{ horaInicio: string, horaTermino: string, correo: string }>
    CambiarHora(horaInicio: string, horaTermino: string): Promise<null>
    CambiarCorreo(correo: string): Promise<null>
}
