import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import PanelPresentacionSesion from '../components/PanelPresentacionSesion'
import { api } from '../services/api'
import '../styles/inicioSesion.css'

export default function RecuperarContrasena() {
  const [correo, establecerCorreo] = useState('')
  const [mensaje, establecerMensaje] = useState('')
  const [error, establecerError] = useState('')
  const [enviando, establecerEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    establecerError('')
    establecerMensaje('')
    if (!correo.trim()) return establecerError('Ingresa tu correo electrónico.')
    establecerEnviando(true)
    try {
      const respuesta = await api.solicitarRestablecimiento(correo.trim())
      establecerMensaje(respuesta.mensaje)
    } catch (fallo) {
      establecerError(fallo.message)
    } finally {
      establecerEnviando(false)
    }
  }

  return <main className="inicio-sesion">
    <PanelPresentacionSesion />
    <div className="acceso-area-formulario"><div className="acceso-contenedor">
      <section className="acceso-tarjeta" aria-labelledby="titulo-recuperacion">
        <h1 id="titulo-recuperacion">Recuperar contraseña</h1>
        <p className="acceso-introduccion">Ingresa el correo asociado a tu cuenta. Te enviaremos un enlace temporal.</p>
        <form onSubmit={enviar} noValidate aria-busy={enviando}>
          <div className="acceso-grupo-campo">
            <label htmlFor="correo-recuperacion">Correo electrónico</label>
            <div className="acceso-campo">
              <Mail size={16} className="acceso-icono-usuario" aria-hidden="true" />
              <input id="correo-recuperacion" type="email" autoComplete="email" autoCapitalize="none"
                value={correo} disabled={enviando} aria-invalid={Boolean(error)}
                onChange={evento => { establecerCorreo(evento.target.value); establecerError('') }} />
            </div>
            {error && <p className="acceso-error" role="alert">{error}</p>}
          </div>
          <button className="acceso-enviar acceso-accion-separada" type="submit" disabled={enviando}>
            <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />{enviando ? 'Enviando…' : 'Enviar enlace'}
          </button>
          <div role="status" aria-live="polite">{mensaje && <p className="acceso-mensaje">{mensaje}</p>}</div>
        </form>
        <p className="acceso-ayuda"><Link className="acceso-recuperar" to="/login">Volver a iniciar sesión</Link></p>
      </section>
    </div></div>
  </main>
}
