import { LayoutDashboard, Bell, History, Settings, UserRound } from 'lucide-react'

export const navegacion = [
  { ruta: '/dashboard', titulo: 'Dashboard', icono: LayoutDashboard, grupo: 'principal' },
  { ruta: '/alertas', titulo: 'Alertas', icono: Bell, grupo: 'principal' },
  { ruta: '/historial', titulo: 'Historial', icono: History, grupo: 'principal' },
  { ruta: '/configuracion', titulo: 'Configuración', icono: Settings, grupo: 'cuenta' },
  { ruta: '/mi-cuenta', titulo: 'Mi cuenta', icono: UserRound, grupo: 'cuenta' },
]

// Los permisos provienen de la sesión autenticada, no del nombre visible del rol.
export function puedeAcceder(usuario, ruta) {
  return Boolean(usuario?.rutasPermitidas?.includes(ruta))
}
