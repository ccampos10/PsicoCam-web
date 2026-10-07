import { useState } from 'react'
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { navegacion, puedeAcceder } from '../routes/navegacion'
import PanelDesplegable from './PanelDesplegable'

export default function Navbar({ alAbrirMenu, alSolicitarCierreSesion, menuAbierto }) {
  const { usuario } = useSesion()
  const { key } = useLocation()
  const [panel, establecerPanel] = useState(null)
  const abierto = panel?.key === key ? panel.nombre : null
  const cerrar = () => establecerPanel(null)
  const alternar = nombre => establecerPanel(abierto === nombre ? null : { nombre, key })
  const iniciales = usuario.nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase() || 'U'
  return <header className="navbar">
    <div className="navbar-heading">
      <button className="navbar-button mobile-toggle" aria-label="Abrir menú" aria-expanded={menuAbierto}
        aria-controls="mobile-navigation" onClick={alAbrirMenu}><Menu size={20} aria-hidden="true" /></button>
      <div><p className="system-name">PsicoCam</p><p className="system-subtitle">Sistema de Monitoreo y Alerta Temprana</p></div>
    </div>
    <div className="navbar-actions">
      <PanelDesplegable id="notifications" etiqueta="Notificaciones" abierto={abierto === 'notificaciones'} alCerrar={cerrar}
        alAlternar={() => alternar('notificaciones')} className="notifications" activador={<Bell size={26} strokeWidth={1.8} aria-hidden="true" />}>
        <h2 className="popover-title">Notificaciones</h2>
        <p className="notification-empty">Las notificaciones estarán disponibles al conectar el servicio de alertas.</p>
        {puedeAcceder(usuario, '/alertas') && <Link className="popover-link" to="/alertas" onClick={cerrar}>Ver alertas</Link>}
      </PanelDesplegable>
      <PanelDesplegable id="user-options" etiqueta={`Menú de usuario: ${usuario.nombre}`} abierto={abierto === 'usuario'} alCerrar={cerrar}
        alAlternar={() => alternar('usuario')} activador={<>
          <span className="avatar" aria-hidden="true">{iniciales}</span>
          <span className="user-info"><span>{usuario.nombre}</span><small>{usuario.rol}</small></span>
          <ChevronDown size={12} className="user-chevron" aria-hidden="true" />
        </>}>
        <div className="popover-title"><p>{usuario.nombre}</p><small>{usuario.rol}</small></div>
        {navegacion.filter(opcion => opcion.grupo === 'cuenta' && puedeAcceder(usuario, opcion.ruta)).map(({ ruta, titulo, icono: Icono }) =>
          <Link key={ruta} className="popover-link" to={ruta} onClick={cerrar}><Icono size={16} aria-hidden="true" />{titulo}</Link>)}
        <button className="popover-link" onClick={() => { cerrar(); alSolicitarCierreSesion() }}><LogOut size={16} aria-hidden="true" />Cerrar sesión</button>
      </PanelDesplegable>
    </div>
  </header>
}
