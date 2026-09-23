import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Layout from '../layouts/Layout'
import AccesoPendiente from '../pages/AccesoPendiente'
import ModuloPendiente from '../pages/ModuloPendiente'
import PaginaNoEncontrada from '../pages/PaginaNoEncontrada'
import { useSesion } from '../hooks/useSesion'
import { puedeAcceder, navegacion } from './navegacion'

function RequiereSesion() {
  const { usuario } = useSesion()
  return usuario ? <Outlet /> : <Navigate to="/login" replace />
}
function RutaModulo({ opcion }) {
  const { usuario } = useSesion()
  if (!puedeAcceder(usuario, opcion.ruta)) return <section className="placeholder-card"><h1>Acceso restringido</h1>
    <p>Tu cuenta no tiene permisos para acceder a esta sección.</p></section>
  return <ModuloPendiente titulo={opcion.titulo} />
}
function RedireccionInicio() {
  const { usuario } = useSesion()
  return <Navigate to={usuario ? usuario.rutasPermitidas?.[0] || '/dashboard' : '/login'} replace />
}
export default function RutasAplicacion() {
  return <Routes>
    <Route path="/login" element={<AccesoPendiente />} />
    <Route element={<RequiereSesion />}>
      <Route element={<Layout />}>
        <Route index element={<RedireccionInicio />} />
        {navegacion.map(opcion => <Route key={opcion.ruta} path={opcion.ruta} element={<RutaModulo opcion={opcion} />} />)}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Route>
  </Routes>
}
