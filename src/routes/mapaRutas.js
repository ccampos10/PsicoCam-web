import InicioSesion from '../pages/InicioSesion'
import HistorialAlertas from '../pages/HistorialAlertas'
import DetalleAlerta from '../pages/DetalleAlerta'
import ModuloPendiente from '../pages/ModuloPendiente'

export const mapaRutas = {
  acceso: { ruta: '/login', componente: InicioSesion },
  dashboard: { ruta: '/dashboard', titulo: 'Dashboard', componente: ModuloPendiente },
  alertas: { ruta: '/alertas', titulo: 'Alertas', componente: ModuloPendiente },
  historial: { ruta: '/historial', titulo: 'Historial', componente: HistorialAlertas },
  detalleAlerta: { ruta: '/alertas/:idAlerta', titulo: 'Detalle de alerta', componente: DetalleAlerta },
  configuracion: { ruta: '/configuracion', titulo: 'Configuración', componente: ModuloPendiente },
  cuenta: { ruta: '/mi-cuenta', titulo: 'Mi cuenta', componente: ModuloPendiente },
}

export const rutasInternas = Object.values(mapaRutas).filter(opcion => opcion !== mapaRutas.acceso)
