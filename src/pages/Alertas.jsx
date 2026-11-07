import { useState } from 'react'
import { useListadoAlertas } from '../hooks/useListadoAlertas'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import ModalDetalle from '../components/ModalDetalle'
import { ApiAlertaRepository } from '../repositories/ApiAlertaRepository'
import { ColorUrgencia } from '../components/Pilas'
import styles from './Alertas.module.css'

const repositorioPredeterminado = new ApiAlertaRepository()

export default function Alertas({ repositorio = repositorioPredeterminado }) {
  const { alertas, establecerAlertas, cargando, error, reintentar } = useListadoAlertas(repositorio)
  const [alertaSeleccionada, establecerAlertaSeleccionada] = useState(null)
  const [mensajeExito, establecerMensajeExito] = useState('')
  const [totalMostrado, establecerTotalMostrado] = useState(null)


  const alertasPendientes = alertas.filter((alerta) => !alerta.estado_evaluacion || alerta.estado_evaluacion === 'neutro')
  const filtros = [
    { clave: 'busqueda', etiqueta: 'Buscar', tipo: 'texto', campos: ['box', 'supervisor'], placeholder: 'Box o supervisor...' },
    { clave: 'categoria', etiqueta: 'Categoría', tipo: 'select', opciones: ['RS', 'VD'] },
    { clave: 'nivel', etiqueta: 'Nivel', tipo: 'select', opciones: ['Bajo', 'Medio', 'Alto'] },
  ]
  const columnas = [
    { clave: 'box', encabezado: 'Box', renderizar: (valor, item) => <span className={styles.box}><span className={`${styles.punto} ${styles['punto' + item.nivel] || ''}`} />{valor}</span> },
    { clave: 'categoria', encabezado: 'Categoría', renderizar: valor => <span className={styles.categoria}>{valor}</span> },
    { clave: 'nivel', encabezado: 'Nivel de alerta', renderizar: (valor) => <ColorUrgencia valor={valor} /> },
    { clave: 'fecha', encabezado: 'Fecha' },
    { clave: 'hora', encabezado: 'Hora' },
    { clave: 'supervisor', encabezado: 'Supervisor' },
    { clave: 'detalle', encabezado: '', renderizar: () => <span aria-hidden="true">›</span> },
  ]

  async function guardarEvaluacion(alerta, evaluacion, notasClinicas) {
    const actualizada = await repositorio.actualizarEstadoEvaluacion(alerta.id, evaluacion, notasClinicas)
    establecerAlertas((anteriores) => anteriores.map((item) => item.id === actualizada.id ? actualizada : item))
    establecerAlertaSeleccionada(null)
    establecerMensajeExito('Alerta clasificada correctamente.')
  }

  const headerFiltros = <div><h2>Filtrar alertas</h2></div>
  const headerTabla = <div><h2>Alertas pendientes de evaluación</h2><p>Selecciona una alerta para revisar su detalle y clasificarla.</p></div>

  return <div className={styles.pagina}>
    <div className={styles.encabezado}>
      <div><h1>Alertas pendientes</h1><p>{cargando ? 'Cargando alertas…' : error ? 'No se pudo obtener el número de alertas.' : `${alertasPendientes.length} alertas pendientes de evaluación`}</p></div>
    </div>
    {mensajeExito && <div className={styles.exito} role="status"><span>{mensajeExito}</span><button type="button" onClick={() => establecerMensajeExito('')} aria-label="Cerrar mensaje">×</button></div>}
    {cargando
      ? <p className={styles.cargando} role="status">Cargando alertas...</p>
      : error
        ? <div className={styles.error} role="alert"><h2>No se pudieron cargar las alertas</h2><p>{error}</p><button className="button-primary" type="button" onClick={reintentar}>Reintentar</button></div>
        : <PaginaTabla className={styles.tablaAlertas} datos={alertasPendientes} columnas={columnas} filtros={filtros} itemsPorPagina={6} headerFiltros={headerFiltros} headerTabla={headerTabla} pieFiltros={<div className={styles.pieFiltros}><span>Mostrando {totalMostrado ?? alertasPendientes.length} de {alertasPendientes.length}</span><div className={styles.leyenda}><span><i className={styles.puntoBajo} />Bajo</span><span><i className={styles.puntoMedio} />Medio</span><span><i className={styles.puntoAlto} />Alto</span></div></div>} mensajeVacio="No hay alertas pendientes de clasificación." resumenPaginacion alSeleccionarFila={establecerAlertaSeleccionada} onResultadosChange={establecerTotalMostrado} />}
    <ModalDetalle alerta={alertaSeleccionada} onCerrar={() => establecerAlertaSeleccionada(null)} onGuardar={guardarEvaluacion} />
  </div>
}
