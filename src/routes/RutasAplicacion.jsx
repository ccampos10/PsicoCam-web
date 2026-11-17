import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../layouts/Layout'
import LimiteErrores from '../components/LimiteErrores'
import PaginaNoEncontrada from '../pages/PaginaNoEncontrada'
import { useSesion } from '../hooks/useSesion'
import { puedeAcceder } from './navegacion'
import { mapaRutas, rutasInternas } from './mapaRutas'
import RecuperarContrasena from '../pages/RecuperarContrasena'
import RestablecerContrasena from '../pages/RestablecerContrasena'

function RequiereSesion() {
  const { usuario, sesionExpirada, verificandoSesion } = useSesion()
  const ubicacion = useLocation()
  if (verificandoSesion) return <main className="placeholder-card"><p role="status">Comprobando sesion...</p></main>
  return usuario ? <Outlet /> : <Navigate to={mapaRutas.acceso.ruta} replace
    state={{ rutaSolicitada: ubicacion.pathname + ubicacion.search + ubicacion.hash, sesionExpirada }} />
}
function RutaModulo({ opcion }) {
  const ubicacion = useLocation()
  const { usuario } = useSesion()
  if (!puedeAcceder(usuario, opcion.ruta)) return <section className="placeholder-card"><h1>Acceso restringido</h1>
    <p>Tu cuenta no tiene permisos para acceder a esta sección.</p></section>
  const Componente = opcion.componente
  return <LimiteErrores key={ubicacion.pathname}><Componente titulo={opcion.titulo} /></LimiteErrores>
}
function RedireccionInicio() {
  const { usuario } = useSesion()
  return <Navigate to={usuario ? usuario.rutasPermitidas?.[0] || '/dashboard' : '/login'} replace />
}
export default function RutasAplicacion() {
  const ComponenteAcceso = mapaRutas.acceso.componente
  return <Routes>
    <Route path={mapaRutas.acceso.ruta} element={<ComponenteAcceso rutasDisponibles={rutasInternas} />} />
    <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
    <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
    <Route element={<RequiereSesion />}>
      <Route element={<Layout />}>
        <Route index element={<RedireccionInicio />} />
        {rutasInternas.map(opcion => <Route key={opcion.ruta} path={opcion.ruta} element={<RutaModulo opcion={opcion} />} />)}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Route>
  </Routes>
}
