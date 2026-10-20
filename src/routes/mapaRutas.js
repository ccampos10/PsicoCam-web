import InicioSesion from '../pages/InicioSesion'
import Dashboard from '../pages/Dashboard'
import Bitacora from '../pages/Bitacora'
import HistorialAlertas from '../pages/HistorialAlertas'
import DetalleAlerta from '../pages/DetalleAlerta'
import ModuloPendiente from '../pages/ModuloPendiente'
import PaginaConfiguracion from '../pages/PaginaConfiguracion'
import Usuarios from '../pages/Usuarios'
import Alertas from '../pages/Alertas';
import DemoNotificacion from '../pages/DemoNotificacion'

export const mapaRutas = {
  acceso: { ruta: '/login', componente: InicioSesion },
  dashboard: { ruta: '/dashboard', titulo: 'Dashboard', componente: Dashboard },
  usuarios: { ruta: '/usuarios', titulo: 'Gestión de usuarios', componente: Usuarios },
  alertas: {ruta: '/alertas',titulo: 'Alertas',componente: Alertas},
  historial: { ruta: '/historial', titulo: 'Historial de Alertas', componente: HistorialAlertas },
  bitacora: { ruta: "/bitacora", titulo: "Bitácora y auditoría", componente: Bitacora},
  detalleAlerta: { ruta: '/alertas/:idAlerta', titulo: 'Detalle de alerta', componente: DetalleAlerta },
  configuracion: { ruta: '/configuracion', titulo: 'Configuración', componente: PaginaConfiguracion },
  cuenta: { ruta: '/mi-cuenta', titulo: 'Mi cuenta', componente: ModuloPendiente },
  // Ruta temporal para validar visualmente SCRUM-658. No se agrega a navegacion.
  demoNotificacion: { ruta: '/demo-notificacion', titulo: 'Demo de notificaciones', componente: DemoNotificacion },
}

export const rutasInternas = Object.values(mapaRutas).filter(opcion => opcion !== mapaRutas.acceso)
