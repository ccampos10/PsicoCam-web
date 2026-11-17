import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import Modal from './Modal'
import estilos from './FormularioUsuario.module.css'

export default function FormularioUsuario({ usuario, usuarios, alGuardar, alCerrar }) {
  const [datos, establecerDatos] = useState({ nombre: usuario?.nombre ?? '', correo: usuario?.correo ?? '',
    contrasena: '', confirmacion: '', rol: usuario?.rol ?? 'Supervisor', estado: usuario?.estado ?? 'Activo' })
  const [tocados, establecerTocados] = useState({})
  const [enviado, establecerEnviado] = useState(false)
  const [guardando, establecerGuardando] = useState(false)
  const [error, establecerError] = useState('')
  const envioEnCurso = useRef(false)
  const errores = {}
  if (!datos.nombre.trim()) errores.nombre = 'Ingresa el nombre completo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) errores.correo = 'Ingresa un correo válido.'
  else if (usuarios.some(perfil => perfil.id !== usuario?.id && perfil.correo.toLowerCase() === datos.correo.trim().toLowerCase())) errores.correo = 'Ya existe un usuario con ese correo.'
  if (!usuario && !datos.contrasena) errores.contrasena = 'Ingresa una contraseña.'
  else if (datos.contrasena && new TextEncoder().encode(datos.contrasena).length > 72) errores.contrasena = 'La contraseña es demasiado larga. Acórtala e inténtalo nuevamente.'
  else if (datos.contrasena && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(datos.contrasena)) errores.contrasena = 'La contraseña debe tener al menos 8 caracteres e incluir una letra y un número.'
  if (datos.contrasena !== datos.confirmacion) errores.confirmacion = 'Las contraseñas no coinciden.'
  if (!['Administrador', 'Supervisor'].includes(datos.rol)) errores.rol = 'Selecciona un rol válido.'
  if (!['Activo', 'Inactivo'].includes(datos.estado)) errores.estado = 'Selecciona un estado válido.'

  function cambiar(evento) {
    const { name, value } = evento.target
    establecerDatos(actual => ({ ...actual, [name]: value }))
    establecerTocados(actual => ({ ...actual, [name]: true }))
    establecerError('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (envioEnCurso.current) return
    establecerEnviado(true)
    if (Object.keys(errores).length) {
      evento.currentTarget.elements.namedItem(Object.keys(errores)[0])?.focus()
      return
    }
    envioEnCurso.current = true
    establecerGuardando(true)
    establecerError('')
    try {
      const perfil = { nombre: datos.nombre.trim(), correo: datos.correo.trim().toLowerCase(), rol: datos.rol, estado: datos.estado }
      if (datos.contrasena) perfil.contrasena = datos.contrasena
      await alGuardar(perfil)
    } catch (fallo) {
      establecerError(fallo.message || 'No se pudo guardar el usuario. Inténtalo nuevamente.')
    } finally {
      envioEnCurso.current = false
      establecerGuardando(false)
    }
  }

  function campo(nombre, etiqueta, tipo = 'text', placeholder = '') {
    const mensaje = (tocados[nombre] || enviado || (nombre === 'confirmacion' && tocados.contrasena && datos.confirmacion)) && errores[nombre]
    const correoValido = nombre === 'correo' && tocados.correo && !errores.correo
    return <div className={estilos.campo}>
      <label htmlFor={`usuario-${nombre}`}>{etiqueta}</label>
      <input id={`usuario-${nombre}`} name={nombre} type={tipo} value={datos[nombre]} onChange={cambiar}
        onBlur={() => establecerTocados(actual => ({ ...actual, [nombre]: true }))}
        autoComplete={tipo === 'password' ? 'new-password' : nombre === 'correo' ? 'email' : 'name'}
        placeholder={placeholder} disabled={guardando} aria-invalid={Boolean(mensaje)}
        aria-describedby={mensaje || correoValido ? `mensaje-${nombre}` : undefined}
        className={mensaje ? estilos.invalido : correoValido ? estilos.valido : undefined} />
      {mensaje && <small id={`mensaje-${nombre}`} className={estilos.error}>{mensaje}</small>}
      {correoValido && <small id={`mensaje-${nombre}`} className={estilos.exito}>✓ Correo válido</small>}
    </div>
  }

  return <Modal className={estilos.modal} idTitulo="titulo-formulario-usuario" cierreExplicito alCerrar={() => { if (!envioEnCurso.current) alCerrar() }}>
    <header className={estilos.encabezado}>
      <h2 id="titulo-formulario-usuario">{usuario ? 'Editar usuario' : 'Agregar usuario'}</h2>
      <button type="button" className={estilos.iconoCerrar} aria-label="Cerrar formulario" disabled={guardando} onClick={alCerrar}><X size={20} /></button>
    </header>
    <form onSubmit={guardar} noValidate aria-busy={guardando}>
      <div className={estilos.campos}>
        {campo('nombre', 'Nombre completo', 'text', 'Ej. Camila Soto')}
        {campo('correo', 'Correo electrónico', 'email')}
        <div className={estilos.columnas}>
          {campo('contrasena', usuario ? 'Nueva contraseña (opcional)' : 'Contraseña', 'password')}
          {campo('confirmacion', 'Confirmar contraseña', 'password')}
        </div>
        {usuario && <p className={estilos.ayuda}>Deja ambas contraseñas vacías para mantener la actual.</p>}
        <div className={estilos.columnas}>
          <div className={estilos.campo}><label htmlFor="usuario-rol">Rol de acceso</label>
            <select id="usuario-rol" name="rol" value={datos.rol} onChange={cambiar} disabled={guardando}>
              <option>Administrador</option><option>Supervisor</option>
            </select></div>
          <div className={estilos.campo}><label htmlFor="usuario-estado">Estado</label>
            <select id="usuario-estado" name="estado" value={datos.estado} onChange={cambiar} disabled={guardando}>
              <option>Activo</option><option>Inactivo</option>
            </select></div>
        </div>
        {error && <p className={estilos.error} role="alert">{error}</p>}
      </div>
      <footer className={estilos.pie}>
        <button type="submit" className={estilos.guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar usuario'}</button>
        <button type="button" className={estilos.cancelar} disabled={guardando} onClick={alCerrar}>Cancelar</button>
      </footer>
    </form>
  </Modal>
}
