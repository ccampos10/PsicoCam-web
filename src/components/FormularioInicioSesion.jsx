import { useRef, useState } from 'react'
import { ArrowRight, User } from 'lucide-react'
import iconoCandado from '../assets/acceso/candado.svg'
import iconoOjo from '../assets/acceso/ojo.svg'

export default function FormularioInicioSesion({ alEnviar }) {
  const [usuario, establecerUsuario] = useState('')
  const [contrasena, establecerContrasena] = useState('')
  const [recordarme, establecerRecordarme] = useState(false)
  const [mostrarContrasena, establecerMostrarContrasena] = useState(false)
  const [errores, establecerErrores] = useState({})
  const [mensaje, establecerMensaje] = useState('')
  const [enviando, establecerEnviando] = useState(false)
  const referenciaUsuario = useRef(null)
  const referenciaContrasena = useRef(null)
  const envioEnCurso = useRef(false)

  async function enviarFormulario(evento) {
    evento.preventDefault()
    if (envioEnCurso.current) return
    const nuevosErrores = {}
    if (!usuario.trim()) nuevosErrores.usuario = 'Ingresa tu usuario o correo electrónico.'
    if (!contrasena) nuevosErrores.contrasena = 'Ingresa tu contraseña.'
    establecerErrores(nuevosErrores)
    establecerMensaje('')
    if (Object.keys(nuevosErrores).length) {
      if (nuevosErrores.usuario) referenciaUsuario.current.focus()
      else referenciaContrasena.current.focus()
      return
    }
    if (!alEnviar) {
      establecerMensaje('El inicio de sesión no está disponible en este momento.')
      return
    }
    // La integración futura recibe los datos; este componente no autentica.
    envioEnCurso.current = true
    establecerEnviando(true)
    try {
      await alEnviar({ usuario: usuario.trim(), contrasena, recordarme })
    } catch {
      establecerMensaje('No se pudo iniciar sesión. Inténtalo nuevamente.')
    } finally {
      envioEnCurso.current = false
      establecerEnviando(false)
    }
  }

  return <section className="acceso-tarjeta" aria-labelledby="titulo-inicio-sesion">
    <h1 id="titulo-inicio-sesion">Iniciar sesión</h1>
    <p className="acceso-introduccion">Accede con tu cuenta de usuario para ingresar<br className="acceso-salto-descripcion" /> al sistema.</p>
    <form onSubmit={enviarFormulario} noValidate aria-busy={enviando}>
      <div className="acceso-grupo-campo">
        <label htmlFor="usuario-acceso">Usuario o correo electrónico</label>
        <div className="acceso-campo">
          <User size={16} className="acceso-icono-usuario" aria-hidden="true" />
          <input ref={referenciaUsuario} id="usuario-acceso" name="usuario" type="text"
            autoComplete="username" autoCapitalize="none" spellCheck={false} required
            placeholder="profesional@psicocam.cl" value={usuario} disabled={enviando}
            aria-invalid={Boolean(errores.usuario)} aria-describedby={errores.usuario ? 'error-usuario' : undefined}
            onChange={evento => { establecerUsuario(evento.target.value); establecerErrores(actuales => ({ ...actuales, usuario: '' })); establecerMensaje('') }} />
        </div>
        {errores.usuario && <p id="error-usuario" className="acceso-error" role="alert">{errores.usuario}</p>}
      </div>
      <div className="acceso-grupo-campo">
        <label htmlFor="contrasena-acceso">Contraseña</label>
        <div className="acceso-campo">
          <img className="acceso-icono-candado" src={iconoCandado} width="18" height="18" alt="" />
          <input ref={referenciaContrasena} id="contrasena-acceso" name="contrasena"
            type={mostrarContrasena ? 'text' : 'password'} autoComplete="current-password" required
            placeholder="••••••••" value={contrasena} disabled={enviando}
            aria-invalid={Boolean(errores.contrasena)} aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
            onChange={evento => { establecerContrasena(evento.target.value); establecerErrores(actuales => ({ ...actuales, contrasena: '' })); establecerMensaje('') }} />
          <button type="button" className="acceso-mostrar-contrasena" disabled={enviando}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarContrasena}
            onClick={() => establecerMostrarContrasena(actual => !actual)}>
            <img src={iconoOjo} width="22" height="22" alt="" />
          </button>
        </div>
        {errores.contrasena && <p id="error-contrasena" className="acceso-error" role="alert">{errores.contrasena}</p>}
      </div>
      <div className="acceso-opciones">
        <label className="acceso-recordarme"><input type="checkbox" name="recordarme" checked={recordarme}
          disabled={enviando} onChange={evento => establecerRecordarme(evento.target.checked)} />Recordarme</label>
        <button type="button" className="acceso-recuperar" disabled={enviando}
          onClick={() => establecerMensaje('Para recuperar tu acceso, contacta al administrador del sistema.')}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      <button className="acceso-enviar" type="submit" disabled={enviando}>
        <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />{enviando ? 'Enviando…' : 'Iniciar sesión'}
      </button>
      <div role="status" aria-live="polite">{mensaje && <p className="acceso-mensaje">{mensaje}</p>}</div>
    </form>
    <p className="acceso-ayuda">¿Problemas para acceder? Contacta al administrador<br className="acceso-salto-descripcion" /> del sistema.</p>
  </section>
}
