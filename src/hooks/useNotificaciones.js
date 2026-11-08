import { useContext } from 'react'
import { ContextoNotificaciones } from '../context/ContextoNotificaciones'
export function useNotificaciones() { return useContext(ContextoNotificaciones) }
