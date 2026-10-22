import { useState } from 'react'
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { navegacion, puedeAcceder } from '../routes/navegacion'
import PanelDesplegable from './PanelDesplegable'
import { useNotificaciones } from '../context/Notificaciones'
import { ColorUrgencia } from './Pilas'

const formatoFechaAlerta = new Intl.DateTimeFormat('es-CL', {
  timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
function fechaNotificacion(alerta) {
  const fecha = alerta.fecha_generacion
  if (typeof fecha === 'string' && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(fecha) && !Number.isNaN(Date.parse(fecha))) {
    return formatoFechaAlerta.format(new Date(fecha)).replaceAll('-', '/')
  }
  return [alerta.fecha, alerta.hora].filter(Boolean).join(' ')
}

export default function Navbar({ alAbrirMenu, alSolicitarCierreSesion, menuAbierto }) {
  const { usuario } = useSesion()
  const { preferencias, alertas, leidas, marcarTodasLeidas, estado } = useNotificaciones()
  const noLeidas = alertas.filter(alerta => !leidas.has(String(alerta.id))).length
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
        <div className="notification-header"><h2>Notificaciones {noLeidas > 0 && <span className="notification-count" aria-label={`${noLeidas} sin leer`}>{noLeidas}</span>}</h2>
          {preferencias.resumen && estado === 'conectado' && noLeidas > 0 && <button type="button" onClick={marcarTodasLeidas}>Marcar todas como leídas</button>}</div>
        {!preferencias.resumen ? <p className="notification-empty">El resumen está desactivado en Configuración.</p>
          : estado === 'error' ? <p className="notification-empty" role="alert">No se pudieron actualizar las alertas. Revisa la conexión.</p>
            : estado === 'cargando' ? <p className="notification-empty">Consultando alertas…</p>
              : alertas.length === 0 ? <p className="notification-empty">No hay notificaciones.</p>
                : <ul className="notification-list">{alertas.map(alerta => <li key={alerta.id} className={leidas.has(String(alerta.id)) ? '' : 'notification-unread'}>
                  <span className="notification-dot" aria-hidden="true" />
                  <div className="notification-content"><div className="notification-row"><strong>{alerta.box}</strong><time>{fechaNotificacion(alerta)}</time></div>
                    <div className="notification-meta"><span className="notification-category">{alerta.categoria}</span><span>{alerta.categoria === 'RS' ? 'Riesgo suicida' : alerta.categoria === 'VD' ? 'Vulneración de derechos' : 'Detección'}</span><ColorUrgencia valor={alerta.nivel} /></div>
                  </div>
                </li>)}</ul>}
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
