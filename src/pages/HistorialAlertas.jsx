import { useEffect, useState } from 'react'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import { ApiAlertaRepository } from '../repositories/ApiAlertaRepository'
import ModalDetalle from '../components/ModalDetalle'
import styles from './HistorialAlertas.module.css'
import { ColorUrgencia } from '../components/Pilas'

const repositorioAlertas = new ApiAlertaRepository()

export default function HistorialAlertas({ titulo = 'Historial' }) {
  const [alertas, establecerAlertas] = useState([])
  const [cargando, establecerCargando] = useState(true)
  const [alertaSeleccionada, establecerAlertaSeleccionada] = useState(null)
  const [mostrarExito, establecerMostrarExito] = useState(false)
  const [error, establecerError] = useState('')
  const [intento, establecerIntento] = useState(0)
  const [totalMostrado, establecerTotalMostrado] = useState(null)

  useEffect(() => {
    let activo = true
    async function cargarAlertas() {
      try {
        establecerCargando(true)
        establecerAlertas(await repositorioAlertas.getAll())
      } catch (fallo) {
        if (activo) establecerError(fallo.message || 'No se pudieron cargar las alertas.')
      } finally {
        if (activo) establecerCargando(false)
      }
    }
    cargarAlertas()
    return () => { activo = false }
  }, [intento])

  async function guardarEvaluacion(alerta, evaluacion) {
    const actualizada = await repositorioAlertas.actualizarEstadoEvaluacion(alerta.id, evaluacion)
    establecerAlertas((anteriores) => anteriores.map((item) => item.id === actualizada.id ? actualizada : item))
    establecerAlertaSeleccionada(null)
    establecerMostrarExito(true)
    setTimeout(() => establecerMostrarExito(false), 4000)
  }

  const alertasEvaluadas = alertas.filter((alerta) => ['correcta', 'falso positivo'].includes(alerta.estado_evaluacion))
  const filtros = [
    { clave: 'busqueda', etiqueta: 'Buscar', tipo: 'texto', campos: ['box', 'supervisor'], placeholder: 'Box o supervisor...' },
    { clave: 'fecha', etiqueta: 'Fecha detección', tipo: 'fecha' },
    { clave: 'categoria', etiqueta: 'Categoría', tipo: 'select', opciones: ['RS', 'VD'] },
    { clave: 'nivel', etiqueta: 'Nivel de alerta', tipo: 'select', opciones: ['Bajo', 'Medio', 'Alto'] },
    { clave: 'estado_evaluacion', etiqueta: 'Resultado de evaluación', tipo: 'select', ignorarMayusculas: true, opciones: [{ valor: 'correcta', etiqueta: 'Correcta' }, { valor: 'falso positivo', etiqueta: 'Falso positivo' }] },
  ]
  const columnas = [
    { clave: 'fecha', encabezado: 'Fecha / Hora' },
    { clave: 'box', encabezado: 'Box' },
    { clave: 'nivel', encabezado: 'Nivel de riesgo', renderizar: (valor) => <ColorUrgencia valor={valor} /> },
    { clave: 'estado_evaluacion', encabezado: 'Estado' },
    { clave: 'acciones', encabezado: '', renderizar: (_, item) => <button type="button" className={styles.btnAccion} onClick={() => establecerAlertaSeleccionada(item)}>Ver detalle</button> },
  ]
  const headerFiltros = <h2>Filtrar historial</h2>
  const headerTabla = <div className={styles.titulo}><h2>Registro de alertas</h2><p className={styles.subtitulo}>Alertas que ya fueron evaluadas.</p></div>

  return <div>
    <div className={styles.header}>
      <h1>{titulo}</h1>
      <p className={styles.subtitulo}>Registro histórico de alertas evaluadas por el equipo clínico.</p>
    </div>
    {mostrarExito && <div className={styles.toastExito} role="status"><p className={styles.toastTitle}>Evaluación registrada correctamente</p><button type="button" onClick={() => establecerMostrarExito(false)} className={styles.toastCloseBtn} aria-label="Cerrar notificación">×</button></div>}
    {cargando
      ? <p className={styles.loadingText}>Cargando alertas...</p>
      : error
        ? <div role="alert"><p>{error}</p><button type="button" onClick={() => { establecerError(''); establecerIntento((valor) => valor + 1) }}>Reintentar</button></div>
        : <><PaginaTabla columnas={columnas} datos={alertasEvaluadas} filtros={filtros} headerFiltros={headerFiltros} headerTabla={headerTabla} onResultadosChange={establecerTotalMostrado} /><div className={styles.pieFiltros}>Mostrando {totalMostrado ?? alertasEvaluadas.length} de {alertasEvaluadas.length} alertas evaluadas</div></>}
    <ModalDetalle alerta={alertaSeleccionada} onCerrar={() => establecerAlertaSeleccionada(null)} onGuardar={guardarEvaluacion} />
  </div>
}
