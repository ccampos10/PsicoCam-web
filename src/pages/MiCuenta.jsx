import { useState } from 'react'
import { useSesion } from '../hooks/useSesion'
import { api } from '../services/api'
import Modal from '../components/Modal'
import styles from './MiCuenta.module.css'

export default function MiCuenta() {
  const { usuario, actualizarPerfil, cerrarSesion, cerrandoSesion, errorCierreSesion } = useSesion()
  const [editando, setEditando] = useState(false)
  const [cambiandoClave, setCambiandoClave] = useState(false)
  const [confirmarCierre, setConfirmarCierre] = useState(false)
  const [perfil, setPerfil] = useState({ nombre: usuario?.nombre || '', correo: usuario?.correo || '', passwordActual: '' })
  const [clave, setClave] = useState({ passwordActual: '', passwordNueva: '', confirmacion: '' })
  const [mensajePerfil, setMensajePerfil] = useState('')
  const [mensajeClave, setMensajeClave] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [cambiando, setCambiando] = useState(false)
  const iniciales = usuario?.nombre?.trim().split(/\s+/).slice(0, 2).map(parte => parte[0].toUpperCase()).join('') || '?'

  async function guardarPerfil(evento) {
    evento.preventDefault()
    setMensajePerfil('')
    setGuardando(true)
    try {
      await actualizarPerfil(perfil)
      setEditando(false)
      setPerfil(actual => ({ ...actual, passwordActual: '' }))
      setMensajePerfil('Perfil actualizado correctamente.')
    } catch (error) { setMensajePerfil(error.message || 'No se pudo actualizar el perfil.') }
    finally { setGuardando(false) }
  }

  async function cambiarClave(evento) {
    evento.preventDefault()
    setMensajeClave('')
    if (clave.passwordNueva !== clave.confirmacion) {
      setMensajeClave('Las contraseñas nuevas no coinciden.')
      return
    }
    setCambiando(true)
    try {
      await api.cambiarContrasena({ passwordActual: clave.passwordActual, passwordNueva: clave.passwordNueva })
      setClave({ passwordActual: '', passwordNueva: '', confirmacion: '' })
      setCambiandoClave(false)
      setMensajeClave('Contraseña actualizada correctamente.')
    } catch (error) { setMensajeClave(error.message || 'No se pudo actualizar la contraseña.') }
    finally { setCambiando(false) }
  }

  return <div className={styles.pagina}>
    <div className={styles.encabezado}>
      <div><h1>Mi cuenta</h1><p>Consulta tu perfil institucional y administra la seguridad de tu sesión.</p></div>
      {api.sesionActual() && <span className={styles.estado}><span aria-hidden="true">●</span> Sesión iniciada</span>}
    </div>
    <div className={styles.columnas}>
      <section className={styles.tarjeta} aria-labelledby="perfil-titulo">
        <div className={styles.cabeceraTarjeta}>
          <div><h2 id="perfil-titulo">Perfil institucional</h2><p className={styles.descripcion}>Información asociada a tu cuenta profesional</p></div>
          {!editando && <button className={styles.secundario} type="button" onClick={() => {
            setPerfil({ nombre: usuario?.nombre || '', correo: usuario?.correo || '', passwordActual: '' })
            setMensajePerfil('')
            setEditando(true)
          }}>Editar perfil</button>}
        </div>
        <div className={styles.perfil}>
          <span className={styles.avatar} aria-hidden="true">{iniciales}</span>
          <div><span className={styles.etiqueta}>Nombre del profesional</span><strong>{usuario?.nombre || 'No disponible'}</strong></div>
        </div>
        {!editando ? <dl className={styles.datos}>
          <div><dt>Correo institucional</dt><dd>{usuario?.correo || 'No disponible'}</dd></div>
          <div><dt>Rol asignado</dt><dd>{usuario?.rol || 'No disponible'}</dd></div>
        </dl> : <form className={styles.formulario} onSubmit={guardarPerfil}>
          <label>Nombre<input required maxLength={50} value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} /></label>
          <label>Correo institucional<input required type="email" maxLength={50} value={perfil.correo} onChange={e => setPerfil({ ...perfil, correo: e.target.value })} /></label>
          <label>Contraseña actual<input required type="password" autoComplete="current-password" value={perfil.passwordActual} onChange={e => setPerfil({ ...perfil, passwordActual: e.target.value })} /></label>
          <div className={styles.acciones}><button disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button><button className={styles.secundario} type="button" onClick={() => setEditando(false)}>Cancelar</button></div>
        </form>}
        {mensajePerfil && <p className={styles.mensaje} role="status">{mensajePerfil}</p>}
      </section>
      <section className={styles.tarjeta} aria-labelledby="seguridad-titulo">
        <h2 id="seguridad-titulo">Seguridad y sesión</h2>
        <p className={styles.descripcion}>Acceso y protección de la cuenta</p>
        <div className={styles.filaSeguridad}>
          <div><h3>Contraseña</h3><p>Actualiza la contraseña de tu cuenta.</p></div>
          {!cambiandoClave && <button className={styles.secundario} type="button" onClick={() => { setMensajeClave(''); setCambiandoClave(true) }}>Cambiar contraseña</button>}
        </div>
        {cambiandoClave && <form className={styles.formulario} onSubmit={cambiarClave}>
          <label>Contraseña actual<input required type="password" autoComplete="current-password" value={clave.passwordActual} onChange={e => setClave({ ...clave, passwordActual: e.target.value })} /></label>
          <label>Nueva contraseña<input required minLength={6} type="password" autoComplete="new-password" value={clave.passwordNueva} onChange={e => setClave({ ...clave, passwordNueva: e.target.value })} /></label>
          <label>Confirmar nueva contraseña<input required minLength={6} type="password" autoComplete="new-password" value={clave.confirmacion} onChange={e => setClave({ ...clave, confirmacion: e.target.value })} /></label>
          <p className={styles.nota}>Usa al menos 6 caracteres.</p>
          <div className={styles.acciones}><button disabled={cambiando}>{cambiando ? 'Actualizando...' : 'Guardar contraseña'}</button><button className={styles.secundario} type="button" onClick={() => { setClave({ passwordActual: '', passwordNueva: '', confirmacion: '' }); setMensajeClave(''); setCambiandoClave(false) }}>Cancelar</button></div>
        </form>}
        {mensajeClave && <p className={styles.mensaje} role="status">{mensajeClave}</p>}
        <div className={styles.filaSesion}>
          <div><h3>Sesión actual</h3><p>Cierra la sesión en este dispositivo.</p></div>
          <button className={styles.cerrar} type="button" onClick={() => setConfirmarCierre(true)}>Cerrar sesión</button>
        </div>
      </section>
    </div>
    {confirmarCierre && <Modal className="logout-dialog" idTitulo="cuenta-cerrar-titulo" alCerrar={() => setConfirmarCierre(false)}>
      <h2 id="cuenta-cerrar-titulo">Cerrar sesión</h2>
      <p>¿Quieres cerrar la sesión en este dispositivo?</p>
      {errorCierreSesion && <p role="alert">{errorCierreSesion}</p>}
      <div className="dialog-actions">
        <button className="button-secondary" type="button" disabled={cerrandoSesion} onClick={() => setConfirmarCierre(false)}>Cancelar</button>
        <button className="button-primary" type="button" disabled={cerrandoSesion} onClick={async () => { if (await cerrarSesion()) setConfirmarCierre(false) }}>{cerrandoSesion ? 'Cerrando...' : 'Cerrar sesión'}</button>
      </div>
    </Modal>}
  </div>
}
