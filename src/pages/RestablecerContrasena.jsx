import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import logoUa from '../assets/ua-logo.png'
import { api } from '../services/api'
import '../styles/inicioSesion.css'

export default function RestablecerContrasena() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token') || ''
  const [password, establecerPassword] = useState('')
  const [confirmacion, establecerConfirmacion] = useState('')
  const [mensaje, establecerMensaje] = useState('')
  const [error, establecerError] = useState(token ? '' : 'El enlace no es válido o está incompleto.')
  const [enviando, establecerEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    establecerError('')
    if (!token) return establecerError('El enlace no es válido o está incompleto.')
    if (password !== confirmacion) return establecerError('Las contraseñas no coinciden.')
    establecerEnviando(true)
    try {
      const respuesta = await api.restablecerContrasena(token, password)
      establecerMensaje(respuesta.mensaje)
      establecerPassword('')
      establecerConfirmacion('')
    } catch (fallo) {
      establecerError(fallo.message)
    } finally {
      establecerEnviando(false)
    }
  }

  return <main className="inicio-sesion">
    <section className="acceso-panel-marca" aria-labelledby="titulo-presentacion">
      <img className="acceso-logo-ua" src={logoUa} alt="Universidad Autónoma" width="141" height="197" />
      <div className="acceso-presentacion">
        <p className="acceso-antetitulo">PSICOCAM - MONITOREO CLÍNICO</p>
        <h2 id="titulo-presentacion">Supervisión<br />continua de los<br /><span>boxes clínicos</span></h2>
        <p className="acceso-descripcion">Protege el acceso a tu cuenta institucional.</p>
      </div>
    </section>
    <div className="acceso-area-formulario"><div className="acceso-contenedor">
      <section className="acceso-tarjeta" aria-labelledby="titulo-restablecimiento">
        <h1 id="titulo-restablecimiento">Crear nueva contraseña</h1>
        <p className="acceso-introduccion">Debe tener al menos 8 caracteres e incluir una letra y un número.</p>
        {mensaje ? <>
          <p className="acceso-mensaje" role="status">{mensaje}</p>
          <Link className="acceso-enviar acceso-enlace-boton" to="/login">Iniciar sesión</Link>
        </> : <form onSubmit={enviar} noValidate aria-busy={enviando}>
          <div className="acceso-grupo-campo">
            <label htmlFor="password-nueva">Nueva contraseña</label>
            <div className="acceso-campo"><input id="password-nueva" type="password" autoComplete="new-password"
              value={password} disabled={enviando} onChange={evento => { establecerPassword(evento.target.value); establecerError('') }} /></div>
          </div>
          <div className="acceso-grupo-campo">
            <label htmlFor="password-confirmacion">Confirmar nueva contraseña</label>
            <div className="acceso-campo"><input id="password-confirmacion" type="password" autoComplete="new-password"
              value={confirmacion} disabled={enviando} onChange={evento => { establecerConfirmacion(evento.target.value); establecerError('') }} /></div>
          </div>
          {error && <p className="acceso-error" role="alert">{error}</p>}
          <button className="acceso-enviar acceso-accion-separada" type="submit" disabled={enviando || !token}>
            <ArrowRight size={16} strokeWidth={3} aria-hidden="true" />{enviando ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>}
        <p className="acceso-ayuda"><Link className="acceso-recuperar" to="/login">Volver a iniciar sesión</Link></p>
      </section>
    </div></div>
  </main>
}
