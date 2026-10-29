import { useAccesibilidad } from '../context/Accesibilidad'
import { useNotificaciones } from '../context/Notificaciones'
import { ColorUrgencia } from './Pilas'
import styles from './PreferenciasConfiguracion.module.css'

const avisos = [
  ['pantalla', 'Alertas en pantalla', 'Aviso visual cuando llega una nueva alerta'],
  ['sonido', 'Sonidos de alerta', 'Tono breve cuando llega una nueva alerta'],
  ['resumen', 'Resumen de notificaciones', 'Consulta de alertas pendientes en la campana'],
]

export default function PreferenciasConfiguracion() {
  const { preferencias: { texto, contraste, paleta, indicador }, actualizarPreferencia } = useAccesibilidad()
  const { preferencias, cambiarPreferencia, probarSonido, errorSonido } = useNotificaciones()

  return <>
    <div className={styles.columnas}>
      <section className={styles.panel} aria-labelledby="titulo-accesibilidad">
        <h2 id="titulo-accesibilidad">Accesibilidad visual</h2>
        <p className={styles.descripcion}>Ajusta la lectura y la percepción del color en toda la plataforma.</p>
        <div className={styles.filas}>
          <label className={styles.fila}><span><strong>Tamaño de texto</strong><small>Escala de toda la interfaz</small></span><select value={texto} onChange={e => actualizarPreferencia('texto', e.target.value)}><option value="normal">Normal (100 %)</option><option value="grande">Grande (115 %)</option><option value="mayor">Muy grande (130 %)</option></select></label>
          <label className={styles.fila}><span><strong>Contraste de interfaz</strong><small>Contraste de toda la interfaz</small></span><select value={contraste} onChange={e => actualizarPreferencia('contraste', e.target.value)}><option value="normal">Normal</option><option value="alto">Alto</option></select></label>
          <label className={styles.fila}><span><strong>Modo daltonismo</strong><small>Ajuste de colores de toda la interfaz</small></span><select value={paleta} onChange={e => actualizarPreferencia('paleta', e.target.value)}><option value="predeterminada">Predeterminado</option><option value="protanopia">Protanopia</option><option value="deuteranopia">Deuteranopia</option><option value="tritanopia">Tritanopia</option><option value="monocromatico">Monocromático</option></select></label>
          <label className={styles.fila}><span><strong>Identificar riesgo</strong><small>Cómo se representa el nivel de alerta</small></span><select value={indicador} onChange={e => actualizarPreferencia('indicador', e.target.value)}><option value="completo">Texto + ícono + color</option><option value="texto">Solo texto</option></select></label>
        </div>
        <p className={styles.nota}>Los cambios se aplican inmediatamente y se guardan en este navegador para tu cuenta. Las alertas también se identifican con texto e íconos.</p>
      </section>
      <section className={styles.panel} aria-labelledby="titulo-notificaciones">
        <h2 id="titulo-notificaciones">Notificaciones</h2>
        <p className={styles.descripcion}>Preferencias personales para avisos en la plataforma.</p>
        <div className={styles.filas}>
          {avisos.map(([clave, nombre, detalle]) => <div className={styles.fila} key={nombre}>
            <span><strong>{nombre}</strong><small>{detalle}</small></span>
            <span className={styles.estado}><span>{preferencias[clave] ? 'Activado' : 'Desactivado'}</span><input type="checkbox" role="switch" aria-label={nombre} checked={preferencias[clave]} onChange={e => cambiarPreferencia(clave, e.target.checked)} /></span>
          </div>)}
        </div>
        {preferencias.sonido && <button className={styles.probarSonido} type="button" onClick={probarSonido}>Probar sonido</button>}
        {errorSonido && <p role="alert" className={styles.nota}>{errorSonido}</p>}
        <p className={styles.nota}>Funcionan mientras la plataforma está abierta. El navegador puede exigir que pulses «Probar sonido» antes de permitir audio. Se guardan en este navegador.</p>
      </section>
    </div>
    <section className={styles.panel} aria-labelledby="titulo-vista-accesible">
      <h2 id="titulo-vista-accesible">Vista previa accesible</h2>
      <p className={styles.descripcion}>El riesgo se identifica con texto, no solo con color.</p>
      <div className={styles.vista}>
        {['Bajo', 'Medio', 'Alto'].map(nivel => <div className={styles.vistaFila} key={nivel}>
          <ColorUrgencia valor={nivel} />
          <span>Riesgo {nivel.toLowerCase()}</span>
        </div>)}
      </div>
      <p className={styles.resumen}><strong>Vista previa:</strong> texto {texto} · contraste {contraste} · paleta {paleta} · {indicador === 'completo' ? 'texto + ícono + color' : 'solo texto'}</p>
    </section>
  </>
}
