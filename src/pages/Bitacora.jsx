import { useEffect, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import Modal from '../components/Modal'
import { metadatosEvento } from '../utils/eventosBitacora'
import { ApiBitacoraRepository } from '../repositories/ApiBitacoraRepository'
import styles from './Bitacora.module.css'

const repositorioBitacora = new ApiBitacoraRepository()

function fechaVisible(fecha) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || '')
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha || 'No registrada'
}

function textoAccion(accion) {
  return accion ? accion.replaceAll('_', ' ') : 'No registrada'
}

function categoriaEvento(item) {
  const {categoria} = metadatosEvento(item)
  const nombres = {clinico:'Evento clínico', tecnico:'Evento técnico / integración', sistema:'Evento del sistema', sinCategoria:'Sin categoría'}
  return {nombre:nombres[categoria], estilo:styles[categoria]}
}

export default function Bitacora({ titulo = 'Bitácora', repositorio = repositorioBitacora }) {
  const [datos, establecerDatos] = useState([])
  const [error, establecerError] = useState('')
  const [cargando, establecerCargando] = useState(true)
  const [intento, establecerIntento] = useState(0)
  const [seleccionado, establecerSeleccionado] = useState(null)
  const [filtros, establecerFiltros] = useState({ desde: '', hasta: '', usuario: '', tipo: '', resultado: '' })

  useEffect(() => {
    let activo = true
    async function cargar() {
      establecerCargando(true)
      try { const registros = await repositorio.listarRegistros(); if (activo) { establecerDatos(registros.map(item => ({...item, ...metadatosEvento(item)}))); establecerError('') } }
      catch (fallo) { if (activo) establecerError(fallo.message || 'No se pudo cargar la bitácora.') }
      finally { if (activo) establecerCargando(false) }
    }
    cargar()
    return () => { activo = false }
  }, [intento, repositorio])

  const opciones = (campo) => [...new Set(datos.map(item => item[campo]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'es'))
  const registros = datos.filter(item =>
    (!filtros.desde || (item.fecha && item.fecha >= filtros.desde)) &&
    (!filtros.hasta || (item.fecha && item.fecha <= filtros.hasta)) &&
    (!filtros.usuario || item.usuario === filtros.usuario) &&
    (!filtros.tipo || item.tipo === filtros.tipo) &&
    (!filtros.resultado || item.resultado === filtros.resultado)
  ).sort((a, b) => `${b.fecha || ''} ${b.hora || ''}`.localeCompare(`${a.fecha || ''} ${a.hora || ''}`))

  function cambiarFiltro(evento) {
    const { name, value } = evento.target
    establecerFiltros(actual => ({ ...actual, [name]: value }))
  }

  const columnas = [
    { clave: 'fecha', encabezado: 'Fecha / hora', renderizar: (_, item) => <span className={styles.fechaConPunto}><span className={`${styles.punto} ${categoriaEvento(item).estilo}`} aria-label={categoriaEvento(item).nombre} /><span className={styles.fecha}>{fechaVisible(item.fecha)}<small>{item.hora || '—'}</small></span></span> },
    { clave: 'usuario', encabezado: 'Usuario', renderizar: valor => valor || 'No registrado' },
    { clave: 'tipo', encabezado: 'Tipo', renderizar: valor => <span className={styles.nivel}>{valor || 'Sin categoría'}</span> },
    { clave: 'accion', encabezado: 'Acción', renderizar: textoAccion },
    { clave: 'descripcion', encabezado: 'Detalle del evento', renderizar: valor => valor || 'Sin detalle' },
    { clave: 'resultado', encabezado: 'Resultado' },
    { clave: 'detalles', encabezado: '', renderizar: (_, item) => <button type="button" className={styles.detalleBoton} onClick={() => establecerSeleccionado(item)} aria-label={`Ver detalles de ${textoAccion(item.accion)}`}><ChevronRight size={18} /></button> },
  ]

  return <div>
    <div className={styles.header}><h1>{titulo}</h1><p>Trazabilidad de alertas, notificaciones, evaluaciones y eventos técnicos.</p></div>
    {cargando ? <p role="status">Cargando registros...</p> : error
      ? <div className={styles.error} role="alert"><p>{error}</p><button type="button" onClick={() => establecerIntento(valor => valor + 1)}>Reintentar</button></div>
      : <>
        <section className={styles.panel} aria-labelledby="titulo-filtros-bitacora">
          <h2 id="titulo-filtros-bitacora">Filtrar registros</h2>
          <p>Consulta eventos por fecha, usuario, tipo de evento o resultado.</p>
          <div className={styles.filtros}>
            <label>Desde<input type="date" name="desde" value={filtros.desde} onChange={cambiarFiltro} /></label>
            <label>Hasta<input type="date" name="hasta" value={filtros.hasta} onChange={cambiarFiltro} /></label>
            <label>Usuario<select name="usuario" value={filtros.usuario} onChange={cambiarFiltro}><option value="">Todos los usuarios</option>{opciones('usuario').map(valor => <option key={valor} value={valor}>{valor}</option>)}</select></label>
            <label>Tipo de evento<select name="tipo" value={filtros.tipo} onChange={cambiarFiltro}><option value="">Todos los eventos</option>{opciones('tipo').map(valor => <option key={valor} value={valor}>{valor}</option>)}</select></label>
            <label>Resultado<select name="resultado" value={filtros.resultado} onChange={cambiarFiltro}><option value="">Todos</option>{opciones('resultado').map(valor => <option key={valor} value={valor}>{valor}</option>)}</select></label>
          </div>
          {filtros.desde && filtros.hasta && filtros.desde > filtros.hasta && <p className={styles.aviso} role="alert">La fecha inicial debe ser anterior o igual a la fecha final.</p>}
          <p className={styles.contador}>Mostrando {registros.length} de {datos.length} eventos</p>
        </section>
        <PaginaTabla datos={registros} columnas={columnas} itemsPorPagina={6} resumenPaginacion mensajeVacio="No hay registros para mostrar." alSeleccionarFila={establecerSeleccionado} headerTabla={<div><h2>Registro de eventos</h2><p>Cada registro identifica cuándo ocurrió el evento, su responsable y el detalle.</p></div>} />
        <div className={styles.leyenda} aria-label="Categorías de eventos">
          <span><i className={`${styles.punto} ${styles.clinico}`} />Evento clínico</span>
          <span><i className={`${styles.punto} ${styles.tecnico}`} />Evento técnico / integración</span>
          <span><i className={`${styles.punto} ${styles.sistema}`} />Evento del sistema</span>
          {registros.some(item => categoriaEvento(item).nombre === 'Sin categoría') && <span><i className={`${styles.punto} ${styles.sinCategoria}`} />Sin categoría</span>}
        </div>
      </>}
    {seleccionado && <Modal alCerrar={() => establecerSeleccionado(null)} className={styles.modal} idTitulo="titulo-detalle-bitacora">
      <div className={styles.modalCabecera}>
        <div><p className={styles.modalEtiqueta}>Detalle del evento</p><h2 id="titulo-detalle-bitacora">Detalles del registro</h2><p className={styles.modalAccion}>{textoAccion(seleccionado.accion)}</p><p className={styles.modalCategoria}><i className={`${styles.punto} ${categoriaEvento(seleccionado).estilo}`} />{categoriaEvento(seleccionado).nombre}</p></div>
        <button type="button" className={styles.cerrarIcono} onClick={() => establecerSeleccionado(null)} aria-label="Cerrar detalle"><X size={18} /></button>
      </div>
      <div className={styles.modalContenido}>
        {[['ID de registro', seleccionado.id || 'No registrado'], ['Fecha', fechaVisible(seleccionado.fecha)], ['Hora', seleccionado.hora || 'No registrada'], ['Usuario responsable', seleccionado.usuario || 'No registrado'], ['Tipo de evento', seleccionado.tipo || 'Sin categoría'], ['Nivel', seleccionado.nivel || 'No registrado'], ['Resultado', seleccionado.resultado || 'No registrado'], ['Acción', textoAccion(seleccionado.accion)], ['Detalle del evento', seleccionado.descripcion || 'Sin detalle']].map(([etiqueta, valor]) => <div className={styles.modalDetalle} key={etiqueta}><span>{etiqueta}</span><span>{valor}</span></div>)}
        <button type="button" className={styles.cerrar} onClick={() => establecerSeleccionado(null)}>Cerrar</button>
      </div>
    </Modal>}
  </div>
}
