import { LayoutDashboard, Bell, Settings, UserRound, ClipboardList, Users, Clock } from 'lucide-react'
import { mapaRutas } from './mapaRutas'

export const navegacion = [
  { ...mapaRutas.dashboard, icono: LayoutDashboard, grupo: 'principal' },
  { ...mapaRutas.alertas, icono: Bell, grupo: 'principal', incluirSubrutas: true },
  { ...mapaRutas.historial, icono: Clock, grupo: 'principal' },
  { ...mapaRutas.bitacora, icono: ClipboardList, grupo: 'principal' },
  { ...mapaRutas.usuarios, icono: Users, grupo: 'principal' },
  { ...mapaRutas.configuracion, icono: Settings, grupo: 'cuenta' },
  { ...mapaRutas.cuenta, icono: UserRound, grupo: 'cuenta' },
]

// Los permisos provienen de la sesion autenticada.
export function puedeAcceder(usuario, ruta) {
  return Boolean(usuario?.rutasPermitidas?.includes(ruta))
}
