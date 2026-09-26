import { LayoutDashboard, Bell, History, Settings, UserRound } from 'lucide-react'
import { mapaRutas } from './mapaRutas'

export const navegacion = [
  { ...mapaRutas.dashboard, icono: LayoutDashboard, grupo: 'principal' },
  { ...mapaRutas.alertas, icono: Bell, grupo: 'principal', incluirSubrutas: true },
  { ...mapaRutas.historial, icono: History, grupo: 'principal' },
  { ...mapaRutas.configuracion, icono: Settings, grupo: 'cuenta' },
  { ...mapaRutas.cuenta, icono: UserRound, grupo: 'cuenta' },
]

// Los permisos provienen de la sesión autenticada, no provienen del nombre visible del rol ojo.
export function puedeAcceder(usuario, ruta) {
  return Boolean(usuario?.rutasPermitidas?.includes(ruta))
}
