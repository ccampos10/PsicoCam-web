import { useState } from 'react'
import { useListadoAlertas } from '../hooks/useListadoAlertas'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import { ApiAlertaRepository } from '../repositories/ApiAlertaRepository'
import ModalDetalle from '../components/ModalDetalle'
import styles from './HistorialAlertas.module.css'
import { ColorUrgencia } from '../components/Pilas'

const repositorioAlertas = new ApiAlertaRepository()

function formatearFechaEvaluacion(valor) {
  if (!valor) return 'No registrada'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return 'No registrada'
  const partes = Object.fromEntries(new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(fecha).map(({ type, value }) => [type, value]))
  return `${partes.day}/${partes.month}/${partes.year} ${partes.hour}:${partes.minute}`
}

export default function HistorialAlertas({ titulo = 'Historial', repositorio = repositorioAlertas }) {
  const { alertas, establecerAlertas, cargando, error, reintentar } = useListadoAlertas(repositorio)
  const [alertaSeleccionada, establecerAlertaSeleccionada] = useState(null)
  const [mostrarExito, establecerMostrarExito] = useState(false)
  const [totalMostrado, establecerTotalMostrado] = useState(null)


  async function guardarEvaluacion(alerta, evaluacion, notasClinicas) {
    const actualizada = await repositorio.actualizarEstadoEvaluacion(alerta.id, evaluacion, notasClinicas)
    establecerAlertas((anteriores) => anteriores.map((item) => item.id === actualizada.id ? actualizada : item))
    establecerAlertaSeleccionada(null)
    establecerMostrarExito(true)
    setTimeout(() => establecerMostrarExito(false), 4000)
  }

  const alertasEvaluadas = alertas
    .filter((alerta) => ['correcta', 'falso positivo'].includes(alerta.estado_evaluacion))
    .sort((a, b) => {
      const fechaA = Date.parse(a.fecha_evaluacion)
      const fechaB = Date.parse(b.fecha_evaluacion)
      if (Number.isNaN(fechaA)) return Number.isNaN(fechaB) ? 0 : 1
      if (Number.isNaN(fechaB)) return -1
      return fechaB - fechaA
    })
  const filtros = [
    { clave: 'busqueda', etiqueta: 'Buscar', tipo: 'texto', campos: ['box', 'supervisor'], placeholder: 'Box o supervisor...' },
    { clave: 'fecha', etiqueta: 'Fecha detección', tipo: 'fecha' },
    { clave: 'categoria', etiqueta: 'Categoría', tipo: 'select', opciones: ['RS', 'VD'] },
    { clave: 'nivel', etiqueta: 'Nivel de alerta', tipo: 'select', opciones: ['Bajo', 'Medio', 'Alto'] },
    { clave: 'estado_evaluacion', etiqueta: 'Resultado de evaluación', tipo: 'select', ignorarMayusculas: true, opciones: [{ valor: 'correcta', etiqueta: 'Correcta' }, { valor: 'falso positivo', etiqueta: 'Falso positivo' }] },
  ]
  const columnas = [
    { clave: 'box', encabezado: 'Box', renderizar: (valor, item) => <span className={styles.box}><span className={`${styles.punto} ${styles['punto' + item.nivel] || ''}`} />{valor}</span> },
    { clave: 'categoria', encabezado: 'Cat', renderizar: valor => <span className={styles.categoria}>{valor}</span> },
    { clave: 'nivel', encabezado: 'Nivel de riesgo', renderizar: (valor) => <ColorUrgencia valor={valor} /> },
    { clave: 'fecha', encabezado: 'Fecha' },
    { clave: 'supervisor', encabezado: 'Supervisor' },
    { clave: 'fecha_evaluacion', encabezado: 'Fecha de evaluación', renderizar: formatearFechaEvaluacion },
    { clave: 'estado_evaluacion', encabezado: 'Resultado', renderizar: valor => <span className={valor === 'correcta' ? styles.resultadoCorrecto : styles.resultadoFalso}>{valor === 'correcta' ? 'Correcta' : 'Falso positivo'}</span> },
    { clave: 'acciones', encabezado: '', renderizar: (_, item) => <button type="button" className={styles.btnAccion} onClick={() => establecerAlertaSeleccionada(item)}>Ver detalle</button> },
  ]
  const headerFiltros = <h2>Filtrar historial</h2>
  const headerTabla = <div><h2>Registro de alertas evaluadas</h2><p>Selecciona una alerta para consultar su detalle completo.</p></div>

  return <div>
    <div className={styles.header}>
      <div><h1>{titulo}</h1>
      <p className={styles.subtitulo}>{cargando ? 'Cargando alertas…' : error ? 'No se pudo obtener el historial.' : `${alertasEvaluadas.length} alertas evaluadas`}</p></div>
      {!cargando && !error && <span className={styles.estado}>Alertas revisadas</span>}
    </div>
    {mostrarExito && <div className={styles.toastExito} role="status"><p className={styles.toastTitle}>Evaluación registrada correctamente</p><button type="button" onClick={() => establecerMostrarExito(false)} className={styles.toastCloseBtn} aria-label="Cerrar notificación">×</button></div>}
    {cargando
      ? <p className={styles.loadingText} role="status">Cargando alertas...</p>
      : error
        ? <div className={styles.error} role="alert"><h2>No se pudo cargar el historial</h2><p>{error}</p><button className="button-primary" type="button" onClick={reintentar}>Reintentar</button></div>
        : <PaginaTabla className={styles.tablaHistorial} classNameFiltros={styles.filtrosHistorial} columnas={columnas} datos={alertasEvaluadas} filtros={filtros} headerFiltros={headerFiltros} headerTabla={headerTabla} pieFiltros={<div className={styles.pieFiltros}>Mostrando {totalMostrado ?? alertasEvaluadas.length} de {alertasEvaluadas.length} alertas evaluadas</div>} itemsPorPagina={6} resumenPaginacion mensajeVacio="No hay alertas evaluadas para mostrar." alSeleccionarFila={establecerAlertaSeleccionada} onResultadosChange={establecerTotalMostrado} />}
    <ModalDetalle alerta={alertaSeleccionada} onCerrar={() => establecerAlertaSeleccionada(null)} onGuardar={guardarEvaluacion} />
  </div>
}
