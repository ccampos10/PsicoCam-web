import { useContext } from 'react'
import { ContextoSesion } from '../context/ContextoSesion'
export function useSesion() {
  const sesion = useContext(ContextoSesion)
  if (!sesion) throw new Error('useSesion requiere ProveedorSesion')
  return sesion
}
