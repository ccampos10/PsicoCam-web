import { useContext } from 'react'
import { ContextoAccesibilidad } from '../context/ContextoAccesibilidad'
export function useAccesibilidad() { return useContext(ContextoAccesibilidad) }
