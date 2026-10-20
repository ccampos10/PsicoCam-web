import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import { ColorNivel } from '../components/Pilas'
import Modal from '../components/Modal'
import { ApiBitacoraRepository } from '../repositories/ApiBitacoraRepository'
import styles from './Bitacora.module.css'

const repositorioBitacora = new ApiBitacoraRepository()

function Registro({ item }) {
  const [verModal, establecerVerModal] = useState(false)

  return <>
    <button type="button" className={styles.masDetallesButton} onClick={() => establecerVerModal(true)} aria-label="Ver detalles">
      <ChevronRight />
    </button>
    {verModal && <Modal alCerrar={() => establecerVerModal(false)} className={styles.modal}>
      <div>
        <h2>Detalles del registro</h2>
        <div className={styles.modalDetalle}><p className={styles.modalTitulo}>Fecha</p><p className={styles.modalDato}>{item.fecha}</p></div>
        <div className={styles.modalDetalle}><p className={styles.modalTitulo}>Hora</p><p className={styles.modalDato}>{item.hora}</p></div>
        <div className={styles.modalDetalle}><p className={styles.modalTitulo}>Nivel</p><ColorNivel valor={item.nivel} /></div>
        <div className={styles.modalDetalle}><p className={styles.modalTitulo}>Usuario</p><p className={styles.modalDato}>{item.usuario}</p></div>
        <div className={styles.modalDetalle}><p className={styles.modalTitulo}>Descripción</p><p className={styles.modalDato}>{item.descripcion}</p></div>
        <button type="button" className={styles.modalButton} onClick={() => establecerVerModal(false)}>Cerrar</button>
      </div>
    </Modal>}
  </>
}

export default function Bitacora({ titulo = 'Bitácora', rutasDisponibles = [], alEnviar }) {
  const [datos, establecerDatos] = useState([])
  const [error, establecerError] = useState('')
  const [intento, establecerIntento] = useState(0)

  useEffect(() => {
    let activo = true
    repositorioBitacora.listarRegistros()
      .then((registros) => { if (activo) establecerDatos(registros) })
      .catch((fallo) => { if (activo) establecerError(fallo.message || 'No se pudo cargar la bitácora.') })
    return () => { activo = false }
  }, [intento])

  const columnas = [
    { clave: 'fechaHora', encabezado: 'Fecha/Hora' },
    { clave: 'usuario', encabezado: 'Usuario' },
    { clave: 'nivel', encabezado: 'Nivel', renderizar: (valor) => <ColorNivel valor={valor} /> },
    { clave: 'descripcion', encabezado: 'Descripción' },
    { clave: 'detalles', encabezado: 'Más detalles', renderizar: (_, item) => <Registro item={item} /> },
  ]
  const filtros = [
    { clave: 'usuario', etiqueta: 'Usuario', tipo: 'select', opciones: [...new Set(datos.map((registro) => registro.usuario).filter(Boolean))] },
    { clave: 'nivel', etiqueta: 'Nivel', tipo: 'select', opciones: ['Información', 'Advertencia', 'Grave'] },
  ]
  const headerFiltros = <div className={styles.titulo}><h2>Filtros</h2><p className={styles.subtitulo}>Consulta eventos por usuario o nivel.</p></div>
  const headerTabla = <div className={styles.titulo}><h2>Registro de eventos</h2><p className={styles.subtitulo}>Trazabilidad de las acciones del sistema.</p></div>

  return <div>
    <div className={styles.header}>
      <h1>{titulo}</h1>
      <p className={styles.subtitulo}>Trazabilidad de alertas, notificaciones, evaluaciones y eventos técnicos.</p>
    </div>
    {error
      ? <div role="alert"><p>{error}</p><button type="button" onClick={() => { establecerError(''); establecerIntento((valor) => valor + 1) }}>Reintentar</button></div>
      : <PaginaTabla datos={datos} columnas={columnas} filtros={filtros} headerFiltros={headerFiltros} headerTabla={headerTabla} />}
  </div>
}
