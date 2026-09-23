import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { useSesion } from '../hooks/useSesion'

export default function Layout() {
  const [claveMenuMovil, establecerClaveMenuMovil] = useState(false)
  const [confirmacionCierreAbierta, establecerConfirmacionCierreAbierta] = useState(false)
  const { cerrarSesion, cerrandoSesion, errorCierreSesion } = useSesion()
  const ubicacion = useLocation()
  const menuMovilAbierto = claveMenuMovil === ubicacion.key
  const navegar = useNavigate()
  const referenciaContenido = useRef(null)
  const ubicacionAnterior = useRef(ubicacion.key)
  useEffect(() => {
    if (ubicacionAnterior.current !== ubicacion.key) {
      referenciaContenido.current.focus()
      window.scrollTo(0, 0)
      ubicacionAnterior.current = ubicacion.key
    }
  }, [ubicacion.key])
  useEffect(() => {
    const consultaEscritorio = window.matchMedia('(min-width: 1024px)')
    const cerrarEnEscritorio = () => { if (consultaEscritorio.matches) establecerClaveMenuMovil(false) }
    consultaEscritorio.addEventListener('change', cerrarEnEscritorio)
    return () => consultaEscritorio.removeEventListener('change', cerrarEnEscritorio)
  }, [])
  function solicitarCierreSesion() { establecerClaveMenuMovil(false); establecerConfirmacionCierreAbierta(true) }
  async function confirmarCierreSesion() {
    if (await cerrarSesion()) navegar('/login', { replace: true })
  }
  const cerrarMenuMovil = () => establecerClaveMenuMovil(false)
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <aside className="desktop-sidebar" aria-label="Navegación de PsicoCam"><Sidebar alSolicitarCierreSesion={solicitarCierreSesion} /></aside>
    {menuMovilAbierto && <Modal className="mobile-drawer" idTitulo="drawer-title" alCerrar={cerrarMenuMovil}>
      <div id="mobile-navigation" className="drawer-content">
        <h2 id="drawer-title" className="sr-only">Menú de navegación</h2>
        <button className="drawer-close" aria-label="Cerrar menú" onClick={cerrarMenuMovil}><X size={20} aria-hidden="true" /></button>
        <Sidebar alNavegar={cerrarMenuMovil} alSolicitarCierreSesion={solicitarCierreSesion} />
      </div>
    </Modal>}
    <div className="shell-body">
      <Navbar alAbrirMenu={() => establecerClaveMenuMovil(ubicacion.key)} menuAbierto={menuMovilAbierto} alSolicitarCierreSesion={solicitarCierreSesion} />
      <main id="main-content" ref={referenciaContenido} tabIndex={-1} className="main-content"><div className="content-container"><Outlet /></div></main>
    </div>
    {confirmacionCierreAbierta && <Modal className="logout-dialog" idTitulo="logout-title" alCerrar={() => { if (!cerrandoSesion) establecerConfirmacionCierreAbierta(false) }}>
      <h2 id="logout-title">Cerrar sesión</h2><p>¿Deseas cerrar la sesión?</p>
      {errorCierreSesion && <p role="alert">{errorCierreSesion}</p>}
      <div className="dialog-actions">
        <button className="button-secondary" disabled={cerrandoSesion} onClick={() => establecerConfirmacionCierreAbierta(false)}>Cancelar</button>
        <button className="button-primary" disabled={cerrandoSesion} onClick={confirmarCierreSesion}>{cerrandoSesion ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
      </div>
    </Modal>}
  </div>
}
