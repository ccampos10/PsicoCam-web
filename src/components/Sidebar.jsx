import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navegacion, puedeAcceder } from '../routes/navegacion'
import { useSesion } from '../hooks/useSesion'
import Marca from './Marca'

export default function Sidebar({ alNavegar, alSolicitarCierreSesion }) {
  const { usuario } = useSesion()
  function enlaces(grupo) {
    return navegacion.filter(opcion => opcion.grupo === grupo && puedeAcceder(usuario, opcion.ruta))
      .map(({ ruta, titulo, icono: Icono, incluirSubrutas }) => <NavLink key={ruta} to={ruta} end={!incluirSubrutas}
        className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
        onClick={alNavegar}><Icono size={18} aria-hidden="true" /><span>{titulo}</span></NavLink>)
  }
  return <>
    <Marca />
    <nav className="sidebar-nav" aria-label="Navegación principal">{enlaces('principal')}</nav>
    <div className="sidebar-bottom">
      <nav className="sidebar-nav" aria-label="Ajustes de usuario">{enlaces('cuenta')}</nav>
      <div className="sidebar-logout"><button className="sidebar-link" onClick={alSolicitarCierreSesion}>
        <LogOut size={18} aria-hidden="true" /><span>Cerrar sesión</span>
      </button></div>
    </div>
  </>
}
