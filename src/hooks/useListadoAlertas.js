import { useEffect, useState } from 'react'
import { EVENTO_ALERTAS, EVENTO_EVALUACION } from '../services/eventosAlertas'

export function useListadoAlertas(repositorio) {
  const [alertas, establecerAlertas] = useState([])
  const [cargando, establecerCargando] = useState(true)
  const [error, establecerError] = useState('')
  const [intento, establecerIntento] = useState(0)
  useEffect(() => {
    let activo = true
    let revision = 0
    const recibir = ({ detail }) => { if (Array.isArray(detail)) { revision += 1; establecerAlertas(detail) } }
    const evaluar = ({ detail }) => { revision += 1; establecerAlertas(actuales => actuales.map(item => String(item.id) === String(detail.id) ? detail : item)) }
    if (repositorio.actualizacionesEnVivo) {
      window.addEventListener(EVENTO_ALERTAS, recibir)
      window.addEventListener(EVENTO_EVALUACION, evaluar)
    }
    async function cargar() {
      establecerCargando(true); establecerError('')
      const inicio = revision
      try {
        const datos = await repositorio.getAll()
        if (!Array.isArray(datos)) throw new Error('El servidor devolvió una lista de alertas inválida.')
        if (activo && revision === inicio) establecerAlertas(datos)
      } catch (fallo) { if (activo) establecerError(fallo.message || 'No se pudieron cargar las alertas.') }
      finally { if (activo) establecerCargando(false) }
    }
    cargar()
    return () => { activo = false; window.removeEventListener(EVENTO_ALERTAS, recibir); window.removeEventListener(EVENTO_EVALUACION, evaluar) }
  }, [repositorio, intento])
  return { alertas, establecerAlertas, cargando, error, reintentar: () => establecerIntento(valor => valor + 1) }
}
