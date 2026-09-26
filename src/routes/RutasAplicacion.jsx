import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Layout from '../layouts/Layout'
import PaginaNoEncontrada from '../pages/PaginaNoEncontrada'
import { useSesion } from '../hooks/useSesion'
import { puedeAcceder } from './navegacion'
import { mapaRutas, rutasInternas } from './mapaRutas'

function RequiereSesion() {
  const { usuario } = useSesion()
  const ubicacion = useLocation()
  return usuario ? <Outlet /> : <Navigate to={mapaRutas.acceso.ruta} replace
    state={{ rutaSolicitada: ubicacion.pathname + ubicacion.search + ubicacion.hash }} />
}
function RutaModulo({ opcion }) {
  const { usuario } = useSesion()
  if (!puedeAcceder(usuario, opcion.ruta)) return <section className="placeholder-card"><h1>Acceso restringido</h1>
    <p>Tu cuenta no tiene permisos para acceder a esta sección.</p></section>
  const Componente = opcion.componente
  return <Componente titulo={opcion.titulo} />
}
function RedireccionInicio() {
  const { usuario } = useSesion()
  return <Navigate to={usuario ? usuario.rutasPermitidas?.[0] || '/dashboard' : '/login'} replace />
}
export default function RutasAplicacion() {
  const ComponenteAcceso = mapaRutas.acceso.componente
  return <Routes>
    <Route path={mapaRutas.acceso.ruta} element={<ComponenteAcceso rutasDisponibles={rutasInternas} />} />
    <Route element={<RequiereSesion />}>
      <Route element={<Layout />}>
        <Route index element={<RedireccionInicio />} />
        {rutasInternas.map(opcion => <Route key={opcion.ruta} path={opcion.ruta} element={<RutaModulo opcion={opcion} />} />)}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Route>
  </Routes>
}
