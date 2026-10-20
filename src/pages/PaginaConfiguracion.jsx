import { useEffect, useState } from 'react'
import { ConfiguracionForm } from '../components/ConfiguracionForm/ConfiguracionForm'
import { ApiSettingsRepository } from '../repositories/ApiSettingsRepository'
import styles from './PaginaConfiguracion.module.css'

const repositorioConfiguracion = new ApiSettingsRepository()

export default function PaginaConfiguracion({ titulo }) {
  const [configuracion, setConfiguracion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true
    setCargando(true)
    repositorioConfiguracion.obtenerConfiguracion()
      .then((datos) => { if (activo) setConfiguracion(datos) })
      .catch((fallo) => { if (activo) setError(fallo.message || 'No se pudo cargar la configuracion.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [intento])

  async function guardarConfiguracion(nuevaConfiguracion) {
    const actualizada = await repositorioConfiguracion.actualizarConfiguracion(nuevaConfiguracion)
    setConfiguracion(actualizada)
  }

  return <div className={styles.pagina}>
    <div className={styles.encabezado}>
      <h1>{titulo}</h1>
      <p>Ajusta los parametros operativos que rigen la captura, el procesamiento de los boxes y los canales de notificacion.</p>
    </div>

    {cargando
      ? <p className={styles.cargando}>Cargando configuracion...</p>
      : error
        ? <div role="alert"><p>{error}</p><button type="button" onClick={() => { setError(''); setIntento((valor) => valor + 1) }}>Reintentar</button></div>
        : <ConfiguracionForm valoresIniciales={configuracion} onGuardar={guardarConfiguracion} />}
  </div>
}
