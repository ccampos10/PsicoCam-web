import { useEffect, useState } from 'react'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import ModalDetalle from '../components/ModalDetalle'
import { ApiAlertaRepository } from '../repositories/ApiAlertaRepository'
import { ColorUrgencia } from '../components/Pilas'
import styles from './Alertas.module.css'

const repositorioPredeterminado = new ApiAlertaRepository()

export default function Alertas({ repositorio = repositorioPredeterminado }) {
  const [alertas, establecerAlertas] = useState([])
  const [cargando, establecerCargando] = useState(true)
  const [error, establecerError] = useState('')
  const [alertaSeleccionada, establecerAlertaSeleccionada] = useState(null)
  const [mensajeExito, establecerMensajeExito] = useState('')
  const [totalMostrado, establecerTotalMostrado] = useState(null)
  const [intento, establecerIntento] = useState(0)

  useEffect(() => {
    let activo = true
    async function cargarAlertas() {
      try {
        establecerCargando(true)
        establecerError('')
        const datos = await repositorio.getAll()
        if (activo) establecerAlertas(datos)
      } catch (fallo) {
        if (activo) establecerError(fallo.message || 'No se pudieron cargar las alertas.')
      } finally {
        if (activo) establecerCargando(false)
      }
    }
    cargarAlertas()
    return () => { activo = false }
  }, [repositorio, intento])

  const alertasPendientes = alertas.filter((alerta) => !alerta.estado_evaluacion || alerta.estado_evaluacion === 'neutro')
  const filtros = [
    { clave: 'busqueda', etiqueta: 'Buscar', tipo: 'texto', campos: ['box', 'supervisor'], placeholder: 'Box o supervisor...' },
    { clave: 'fecha', etiqueta: 'Fecha detección', tipo: 'fecha' },
    { clave: 'categoria', etiqueta: 'Categoría', tipo: 'select', opciones: ['RS', 'VD'] },
    { clave: 'nivel', etiqueta: 'Nivel', tipo: 'select', opciones: ['Bajo', 'Medio', 'Alto'] },
  ]
  const columnas = [
    { clave: 'box', encabezado: 'Box' },
    { clave: 'categoria', encabezado: 'Categoría' },
    { clave: 'nivel', encabezado: 'Nivel de alerta', renderizar: (valor) => <ColorUrgencia valor={valor} /> },
    { clave: 'fecha', encabezado: 'Fecha' },
    { clave: 'hora', encabezado: 'Hora' },
    { clave: 'supervisor', encabezado: 'Supervisor' },
  ]

  async function guardarEvaluacion(alerta, evaluacion) {
    const actualizada = await repositorio.actualizarEstadoEvaluacion(alerta.id, evaluacion)
    establecerAlertas((anteriores) => anteriores.map((item) => item.id === actualizada.id ? actualizada : item))
    establecerAlertaSeleccionada(null)
    establecerMensajeExito('Alerta clasificada correctamente.')
  }

  const headerFiltros = <div><h2>Filtrar alertas</h2></div>
  const headerTabla = <div><h2>Alertas pendientes de evaluación</h2><p>Selecciona una alerta para revisar su detalle y clasificarla.</p></div>

  return <div className={styles.pagina}>
    <div className={styles.encabezado}>
      <div><h1>Alertas</h1><p>{alertasPendientes.length} alertas pendientes de evaluación</p></div>
      <span className={styles.estadoMonitoreo}><span className={styles.puntoActivo} />Monitoreo activo</span>
    </div>
    {mensajeExito && <div className={styles.exito} role="status"><span>{mensajeExito}</span><button type="button" onClick={() => establecerMensajeExito('')} aria-label="Cerrar mensaje">×</button></div>}
    {cargando
      ? <p>Cargando alertas...</p>
      : error
        ? <div role="alert"><p>{error}</p><button type="button" onClick={() => establecerIntento((valor) => valor + 1)}>Reintentar</button></div>
        : <><PaginaTabla datos={alertasPendientes} columnas={columnas} filtros={filtros} itemsPorPagina={6} headerFiltros={headerFiltros} headerTabla={headerTabla} mensajeVacio="No hay alertas pendientes de clasificación." resumenPaginacion alSeleccionarFila={establecerAlertaSeleccionada} onResultadosChange={establecerTotalMostrado} /><div className={styles.pieFiltros}>Mostrando {totalMostrado ?? alertasPendientes.length} de {alertasPendientes.length}</div></>}
    <ModalDetalle alerta={alertaSeleccionada} onCerrar={() => establecerAlertaSeleccionada(null)} onGuardar={guardarEvaluacion} />
  </div>
}
