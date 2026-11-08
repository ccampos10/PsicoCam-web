import { useContext, useEffect, useRef, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import Modal from './Modal'
import { ColorUrgencia } from './Pilas'
import { ContextoSesion } from '../context/ContextoSesion'
import { api } from '../services/api'
import { formatearFechaEvaluacion } from '../utils/fechaHora'
import styles from './ModalDetalle.module.css'

const categorias = { RS: 'Riesgo Suicida (RS)', VD: 'Vulneración de Derechos (VD)' }

function Recurso({ titulo, cargar, children, cabecera }) {
  const [abierto, setAbierto] = useState(false)
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const solicitud = useRef(0)
  useEffect(() => () => { solicitud.current += 1 }, [])
  async function alternar() {
    const actual = ++solicitud.current
    if (abierto) { setAbierto(false); setDatos(null); setError(''); setCargando(false); return }
    setAbierto(true); setCargando(true); setError('')
    try { const respuesta = await cargar(); if (actual === solicitud.current) setDatos(respuesta) }
    catch (fallo) { if (actual === solicitud.current) setError(fallo.message || 'No se pudo cargar la información.') }
    finally { if (actual === solicitud.current) setCargando(false) }
  }
  return <div className={styles.evidenciaCaja}>
    <div className={styles.evidenciaCabecera}>{cabecera}<button type="button" className={styles.botonTranscripcion} aria-expanded={abierto} onClick={alternar}>{abierto ? 'Ocultar' : 'Ver'} {titulo}</button></div>
    {abierto && <div className={styles.transcripcion}>{cargando ? <p role="status">Cargando...</p> : error ? <p role="alert">{error}</p> : datos !== null ? children(datos) : null}</div>}
  </div>
}

export default function DetalleContenido({ alerta, onCerrar, onGuardar, enPagina = false }) {
  const usuario = useContext(ContextoSesion)?.usuario
  const autorizado = alerta.puede_evaluar ?? (String(usuario?.rol || '').toLowerCase() === 'administrador' ||
    (String(usuario?.rol || '').toLowerCase() === 'supervisor' && Boolean(usuario?.correo) && usuario.correo.trim().toLowerCase() === String(alerta.supervisor || '').trim().toLowerCase()))
  const inicial = ['correcta', 'falso positivo'].includes(alerta.estado_evaluacion) ? alerta.estado_evaluacion : ''
  const [evaluacion, setEvaluacion] = useState(inicial)
  const [notas, setNotas] = useState(alerta.notas_clinicas || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const enCurso = useRef(false)
  const hayCambios = evaluacion !== inicial || notas !== (alerta.notas_clinicas || '')
  const puedeGuardar = autorizado && Boolean(onGuardar) && Boolean(evaluacion) && hayCambios && !guardando
  async function guardar() {
    if (!puedeGuardar || enCurso.current) return
    enCurso.current = true; setGuardando(true); setError('')
    try { await onGuardar(alerta, evaluacion, notas) }
    catch (fallo) { setError(fallo.message || 'No se pudo guardar la evaluación.') }
    finally { enCurso.current = false; setGuardando(false) }
  }
  const contenido = <div className={styles.contenido}>
    <header className={styles.header} role="group"><div><h2 id="detalle-alerta-titulo">{enPagina ? 'Información del evento' : 'Detalle de alerta'}</h2><p>Información asociada al evento detectado</p></div>
      {!enPagina && <button type="button" onClick={onCerrar} aria-label="Cerrar detalle" className={styles.cerrar} disabled={guardando}><X size={20} aria-hidden="true" /></button>}
    </header>
    <div className={styles.body}>
      <dl className={styles.lista}>
        {[['Box', alerta.box], ['Tipo de detección', categorias[alerta.categoria] || alerta.categoria], ['Fecha', alerta.fecha], ['Hora', alerta.hora], ['Supervisor', alerta.supervisor]].map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor || 'No registrado'}</dd></div>)}
        <div><dt>Nivel de urgencia</dt><dd>{['Alto', 'Medio', 'Bajo'].includes(alerta.nivel) ? <ColorUrgencia valor={alerta.nivel} /> : 'No registrado'}</dd></div>
        {inicial && <><div><dt>Resultado registrado</dt><dd>{inicial === 'correcta' ? 'Correcta' : 'Falso positivo'}</dd></div><div><dt>Fecha de evaluación</dt><dd>{formatearFechaEvaluacion(alerta.fecha_evaluacion)}</dd></div></>}
      </dl>
      <section className={styles.evidencia}><h3>Evidencia de la detección</h3>
        <Recurso titulo="transcripción" cabecera={<><span className={styles.icono}><MessageSquare size={18} aria-hidden="true" /></span><div><strong>Transcripción del evento</strong><p>{autorizado ? 'Disponible para tu cuenta.' : 'Acceso exclusivo al supervisor asignado y administradores.'}</p></div></>} cargar={async () => {
          const datos = await api.obtenerTranscripcion(alerta.id)
          if (!Array.isArray(datos?.conversacion)) throw new Error('La transcripción recibida tiene un formato inesperado.')
          return datos.conversacion
        }}>{datos => datos.length ? datos.map((item, i) => <div className={styles.fragmento} key={i}><strong>{item.persona || 'Hablante no identificado'}</strong><p>{item.detectado ? <mark>{item.frase}</mark> : item.frase}</p></div>) : <p>No hay transcripción disponible para esta alerta.</p>}</Recurso>
      </section>
      <fieldset className={styles.evaluacion} disabled={!autorizado || guardando}><legend>{inicial ? 'Evaluación registrada' : 'Evaluación del supervisor'}</legend>
        <label className={styles.opcion}><input type="radio" name="evaluacion" value="correcta" checked={evaluacion === 'correcta'} onChange={e => setEvaluacion(e.target.value)} /><span><strong>Correcta</strong><small>La detección corresponde a una situación real de riesgo.</small></span></label>
        <label className={styles.opcion}><input type="radio" name="evaluacion" value="falso positivo" checked={evaluacion === 'falso positivo'} onChange={e => setEvaluacion(e.target.value)} /><span><strong>Falso positivo</strong><small>La expresión detectada no representa un riesgo real en este contexto.</small></span></label>
      </fieldset>
      {!autorizado ? <p className={styles.aviso}>Solo el supervisor asignado y los administradores pueden evaluar esta alerta.</p> : <>
        {inicial && <p className={styles.aviso}>Puedes modificar el resultado o las notas y guardar una nueva evaluación.</p>}
        <label className={styles.notas}>Notas clínicas (opcional)<textarea maxLength={5000} rows={3} value={notas} disabled={guardando} onChange={e => setNotas(e.target.value)} placeholder="Añade observaciones sobre la evaluación..." /></label>
        <Recurso titulo="bitácora de auditoría" cargar={() => api.obtenerAuditoriaAlerta(alerta.id)}>{registros => registros.length ? <ul className={styles.listaAuditoria}>{registros.map(r => <li key={r.id}><strong>{r.accion?.replaceAll('_', ' ') || 'Evento registrado'}</strong><span>{r.fecha} {r.hora} · {r.usuario}</span><p>{r.detalle}</p></li>)}</ul> : <p>No hay eventos de auditoría para esta alerta.</p>}</Recurso>
      </>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
    <footer className={styles.footer}><button type="button" onClick={guardar} disabled={!puedeGuardar} className={styles.guardar}>{guardando ? 'Guardando...' : inicial ? 'Guardar cambios de evaluación' : 'Guardar evaluación'}</button><button onClick={onCerrar} type="button" className={styles.cancelar} disabled={guardando}>{enPagina ? 'Volver a alertas' : 'Cerrar'}</button></footer>
  </div>
  return enPagina ? <section className={styles.enPagina}>{contenido}</section> : <Modal className={styles.modal} idTitulo="detalle-alerta-titulo" alCerrar={() => { if (!enCurso.current) onCerrar() }}>{contenido}</Modal>
}
