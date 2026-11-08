import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'
import styles from './Notificaciones.module.css'

const predeterminadas = { pantalla: true, sonido: false, resumen: true }
import { ContextoNotificaciones } from './ContextoNotificaciones'
import { EVENTO_EVALUACION } from '../services/eventosAlertas'
const INTERVALO = 15000

export function ProveedorNotificaciones({ usuario, children }) {
  const id = usuario?.id ?? usuario?.correo
  const clave = id == null ? null : `psicocam_notificaciones_${id}`
  const [preferencias, establecerPreferencias] = useState(() => {
    try {
      const datos = clave ? JSON.parse(localStorage.getItem(clave)) : null
      return Object.fromEntries(Object.entries(predeterminadas).map(([k, valor]) => [k, typeof datos?.[k] === 'boolean' ? datos[k] : valor]))
    } catch { return predeterminadas }
  })
  const [pendientes, establecerPendientes] = useState([])
  const [alertas, establecerAlertas] = useState([])
  const [leidas, establecerLeidas] = useState(() => {
    try {
      const datos = clave ? JSON.parse(localStorage.getItem(`${clave}_leidas`)) : []
      return new Set(Array.isArray(datos) ? datos.filter(id => typeof id === 'string') : [])
    } catch { return new Set() }
  })
  const [aviso, establecerAviso] = useState(null)
  const [estado, establecerEstado] = useState('cargando')
  const [errorSonido, establecerErrorSonido] = useState('')
  const anteriores = useRef(null)
  const audio = useRef(null)
  const opciones = useRef(preferencias)
  useEffect(() => { opciones.current = preferencias }, [preferencias])

  function cambiarPreferencia(nombre, valor) {
    if (!Object.hasOwn(predeterminadas, nombre) || typeof valor !== 'boolean') return
    establecerPreferencias(actual => {
      const nuevas = { ...actual, [nombre]: valor }
      try { if (clave) localStorage.setItem(clave, JSON.stringify(nuevas)) } catch { /* almacenamiento no disponible */ }
      return nuevas
    })
    if (nombre === 'pantalla' && !valor) establecerAviso(null)
  }

  function marcarTodasLeidas() {
    const siguientes = new Set([...leidas, ...alertas.map(a => String(a.id))])
    establecerLeidas(siguientes)
    try { if (clave) localStorage.setItem(`${clave}_leidas`, JSON.stringify([...siguientes])) } catch { /* almacenamiento no disponible */ }
  }

  async function probarSonido() {
    try {
      const ContextoAudio = window.AudioContext || window.webkitAudioContext
      if (!ContextoAudio) throw new Error('Audio no disponible')
      if (!audio.current) audio.current = new ContextoAudio()
      const contexto = audio.current
      if (contexto.state === 'suspended') await contexto.resume()
      if (contexto.state !== 'running') throw new Error('Audio bloqueado')
      // Tres notas suaves con ataque y caída graduales, sin cortes bruscos.
      ;[[659.25, 0], [783.99, 0.22], [698.46, 0.44]].forEach(([frecuencia, retraso]) => {
        const oscilador = contexto.createOscillator()
        const volumen = contexto.createGain()
        const inicio = contexto.currentTime + retraso
        oscilador.type = 'sine'
        oscilador.frequency.value = frecuencia
        volumen.gain.setValueAtTime(0.001, inicio)
        volumen.gain.exponentialRampToValueAtTime(0.28, inicio + 0.035)
        volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.25)
        oscilador.connect(volumen)
        volumen.connect(contexto.destination)
        oscilador.start(inicio)
        oscilador.stop(inicio + 0.26)
      })
      establecerErrorSonido('')
      return true
    } catch {
      establecerErrorSonido('El navegador no pudo reproducir el sonido. Pulsa «Probar sonido» y revisa el volumen.')
      return false
    }
  }

  useEffect(() => {
    if (!usuario?.id && !usuario?.correo) return
    let vigente = true
    let temporizador
    async function consultar() {
      try {
        const alertas = await api.listarAlertas()
        if (!vigente) return
        if (!Array.isArray(alertas)) throw new Error('Respuesta inválida')
        const admin = String(usuario.rol || '').toLowerCase() === 'administrador'
        const correo = String(usuario.correo || '').trim().toLowerCase()
        const visibles = alertas.filter(a => admin || (correo && String(a.supervisor || '').trim().toLowerCase() === correo))
        const ids = new Set(visibles.map(a => String(a.id)))
        const nuevas = anteriores.current === null ? [] : visibles.filter(a => !anteriores.current.has(String(a.id)) && (!a.estado_evaluacion || a.estado_evaluacion === 'neutro'))
        anteriores.current = ids
        establecerAlertas([...visibles].sort((a, b) => `${b.fecha || ''}T${b.hora || ''}`.localeCompare(`${a.fecha || ''}T${a.hora || ''}`)))
        establecerPendientes(visibles.filter(a => !a.estado_evaluacion || a.estado_evaluacion === 'neutro'))
        establecerEstado('conectado')
        if (nuevas.length && opciones.current.pantalla) establecerAviso(nuevas.length)
        if (nuevas.length && opciones.current.sonido) void probarSonido()
      } catch {
        if (vigente) establecerEstado('error')
      } finally {
        if (vigente) temporizador = setTimeout(consultar, INTERVALO)
      }
    }
    consultar()
    return () => { vigente = false; clearTimeout(temporizador) }
  }, [usuario?.id, usuario?.correo, usuario?.rol])

  useEffect(() => () => { if (audio.current) void audio.current.close().catch(() => {}) }, [])
  useEffect(() => {
    const actualizar = ({ detail }) => {
      establecerAlertas(actuales => actuales.map(alerta => String(alerta.id) === String(detail.id) ? detail : alerta))
      establecerPendientes(actuales => actuales.filter(alerta => String(alerta.id) !== String(detail.id)))
    }
    window.addEventListener(EVENTO_EVALUACION, actualizar)
    return () => window.removeEventListener(EVENTO_EVALUACION, actualizar)
  }, [])
  const valor = { preferencias, cambiarPreferencia, pendientes, alertas, leidas, marcarTodasLeidas, estado, probarSonido, errorSonido }
  return <ContextoNotificaciones.Provider value={valor}>{children}
    {aviso && <div className={styles.aviso} role="status">
      <span>{aviso === 1 ? 'Hay una nueva alerta pendiente.' : `Hay ${aviso} nuevas alertas pendientes.`} Revisa la sección Alertas.</span>
      <button type="button" aria-label="Cerrar aviso de alerta" onClick={() => establecerAviso(null)}>×</button>
    </div>}
  </ContextoNotificaciones.Provider>
}
