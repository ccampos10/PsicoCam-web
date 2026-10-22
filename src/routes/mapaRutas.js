import InicioSesion from '../pages/InicioSesion'
import Dashboard from '../pages/Dashboard'
import Bitacora from '../pages/Bitacora'
import HistorialAlertas from '../pages/HistorialAlertas'
import DetalleAlerta from '../pages/DetalleAlerta'
import MiCuenta from '../pages/MiCuenta'
import PaginaConfiguracion from '../pages/PaginaConfiguracion'
import Usuarios from '../pages/Usuarios'
import Alertas from '../pages/Alertas'

export const mapaRutas = {
  acceso: { ruta: '/login', componente: InicioSesion },
  dashboard: { ruta: '/dashboard', titulo: 'Dashboard', componente: Dashboard },
  usuarios: { ruta: '/usuarios', titulo: 'Gestión de usuarios', componente: Usuarios },
  alertas: { ruta: '/alertas', titulo: 'Alertas', componente: Alertas },
  historial: { ruta: '/historial', titulo: 'Historial', componente: HistorialAlertas },
  bitacora: { ruta: '/bitacora', titulo: 'Bitácora', componente: Bitacora },
  detalleAlerta: { ruta: '/alertas/:idAlerta', titulo: 'Detalle de alerta', componente: DetalleAlerta },
  configuracion: { ruta: '/configuracion', titulo: 'Configuración', componente: PaginaConfiguracion },
  cuenta: { ruta: '/mi-cuenta', titulo: 'Mi cuenta', componente: MiCuenta },
}

export const rutasInternas = Object.values(mapaRutas).filter((opcion) => opcion !== mapaRutas.acceso)
