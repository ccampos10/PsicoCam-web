import { useEffect, useState } from 'react'
import { ConfiguracionForm } from '../components/ConfiguracionForm/ConfiguracionForm'
import { ApiSettingsRepository } from '../repositories/ApiSettingsRepository'
import styles from './PaginaConfiguracion.module.css'
import { useSesion } from '../hooks/useSesion'
import PreferenciasConfiguracion from '../components/PreferenciasConfiguracion'

const repositorioConfiguracion = new ApiSettingsRepository()

export default function PaginaConfiguracion({ titulo }) {
  const { usuario } = useSesion()
  const esAdmin = String(usuario?.rol || '').toLowerCase() === 'administrador'
  const [configuracion, setConfiguracion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!esAdmin) return
    let activo = true
    setCargando(true)
    repositorioConfiguracion.obtenerConfiguracion()
      .then((datos) => { if (activo) setConfiguracion(datos) })
      .catch((fallo) => { if (activo) setError(fallo.message || 'No se pudo cargar la configuracion.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [esAdmin, intento])

  async function guardarConfiguracion(nuevaConfiguracion) {
    const actualizada = await repositorioConfiguracion.actualizarConfiguracion(nuevaConfiguracion)
    setConfiguracion(actualizada)
  }

  return <div className={styles.pagina}>
    <div className={styles.encabezado}>
      <h1>{titulo}</h1>
      <p>{esAdmin ? 'Preferencias personales y parámetros de operación del sistema.' : 'Administra tus preferencias personales.'}</p>
    </div>

    <PreferenciasConfiguracion />

    {esAdmin && (cargando
      ? <p className={styles.cargando}>Cargando configuracion...</p>
      : error
        ? <div role="alert"><p>{error}</p><button type="button" onClick={() => { setError(''); setIntento((valor) => valor + 1) }}>Reintentar</button></div>
        : <ConfiguracionForm valoresIniciales={configuracion} onGuardar={guardarConfiguracion} esAdmin={esAdmin} />)}
  </div>
}
