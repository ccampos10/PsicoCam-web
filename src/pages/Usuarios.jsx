import { useEffect, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { PaginaTabla } from '../components/PaginaTabla/PaginaTabla'
import { ApiUsuarioRepository } from '../repositories/ApiUsuarioRepository'
import FormularioUsuario from '../components/FormularioUsuario'
import Modal from '../components/Modal'
import ModalDetalleUsuario from '../components/ModalDetalleUsuario'
import estilos from './Usuarios.module.css'

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago',
})

// Permite buscar sin distinguir mayúsculas ni tildes.
function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const repositorioUsuarios = new ApiUsuarioRepository()

// Presenta los usuarios y deja las acciones disponibles mediante funciones externas.
export default function Usuarios({ servicio = repositorioUsuarios, alAgregar, alEditar, alCambiarEstado, alEliminar }) {
  const [formulario, establecerFormulario] = useState(null)
  const [eliminando, establecerEliminando] = useState(null)
  const [procesando, establecerProcesando] = useState(false)
  const [errorAccion, establecerErrorAccion] = useState('')
  const [mensaje, establecerMensaje] = useState('')
  const [usuarios, establecerUsuarios] = useState([])
  const [usuarioSeleccionado, establecerUsuarioSeleccionado] = useState(null)
  const [busqueda, establecerBusqueda] = useState('')
  const [rol, establecerRol] = useState('')
  const [estado, establecerEstado] = useState('')
  const [cargando, establecerCargando] = useState(true)
  const [error, establecerError] = useState('')
  const [intento, establecerIntento] = useState(0)
  const permiteGestionCompleta = servicio.soportaGestionCompleta !== false

  useEffect(() => {
    let vigente = true
    // Carga los perfiles desde el servicio y evita actualizar una vista desmontada.
    async function cargarUsuarios() {
      establecerCargando(true)
      establecerError('')
      try {
        const datos = await servicio.listarUsuarios()
        if (vigente) establecerUsuarios(datos)
      } catch {
        if (vigente) establecerError('No se pudieron cargar los usuarios. Inténtalo nuevamente.')
      } finally {
        if (vigente) establecerCargando(false)
      }
    }
    cargarUsuarios()
    return () => { vigente = false }
  }, [servicio, intento])

  // Guarda el perfil y actualiza la tabla sin perder la búsqueda.
  async function guardarUsuario(datos) {
    const perfil = formulario.usuario
      ? await servicio.actualizarUsuario(formulario.usuario.id, datos)
      : await servicio.crearUsuario(datos)
    establecerUsuarios(actuales => formulario.usuario
      ? actuales.map(usuario => usuario.id === perfil.id ? perfil : usuario)
      : [...actuales, perfil])
    establecerFormulario(null)
    establecerMensaje('Usuario guardado correctamente.')
  }

  // Alterna el estado simulado de acceso de la cuenta.
  async function cambiarEstado(usuario) {
    if (procesando) return
    establecerProcesando(true)
    establecerErrorAccion('')
    establecerMensaje('')
    try {
      const perfil = await servicio.cambiarEstadoUsuario(usuario.id, usuario.estado === 'Activo' ? 'Inactivo' : 'Activo')
      establecerUsuarios(actuales => actuales.map(actual => actual.id === perfil.id ? perfil : actual))
      establecerMensaje(perfil.estado === 'Activo' ? 'Usuario habilitado.' : 'Usuario bloqueado.')
    } catch (fallo) { establecerErrorAccion(fallo.message || 'No se pudo cambiar el estado.') }
    finally { establecerProcesando(false) }
  }

  // Elimina la cuenta después de la confirmación del administrador.
  async function confirmarEliminacion() {
    if (procesando) return
    establecerProcesando(true)
    establecerErrorAccion('')
    establecerMensaje('')
    try {
      await servicio.eliminarUsuario(eliminando.id)
      establecerUsuarios(actuales => actuales.filter(usuario => usuario.id !== eliminando.id))
      establecerEliminando(null)
      establecerMensaje('Usuario eliminado correctamente.')
    } catch (fallo) { establecerErrorAccion(fallo.message || 'No se pudo eliminar el usuario.') }
    finally { establecerProcesando(false) }
  }
  const textoBuscado = normalizarTexto(busqueda)
  const usuariosEncontrados = usuarios.filter(usuario =>
    (!rol || usuario.rol === rol) && (!estado || usuario.estado === estado) &&
    (normalizarTexto(usuario.nombre).includes(textoBuscado) || normalizarTexto(usuario.correo).includes(textoBuscado)))
  const roles = [...new Set(usuarios.map(usuario => usuario.rol))].sort()
  const estados = [...new Set(usuarios.map(usuario => usuario.estado))].sort()
  const columnas = [
    { clave: 'nombre', encabezado: 'Nombre', renderizar: (nombre, usuario) =>
      <button type="button" className={estilos.nombreUsuario} aria-label={`Ver detalle de ${nombre}`}
        onClick={() => establecerUsuarioSeleccionado(usuario)}>{nombre}</button> },
    { clave: 'correo', encabezado: 'Correo electrónico' },
    { clave: 'rol', encabezado: 'Rol de acceso', renderizar: rol => <span className={rol === 'Administrador' ? estilos.administrador : estilos.profesional}>{rol}</span> },
    { clave: 'estado', encabezado: 'Estado', renderizar: estado =>
      <span className={estado === 'Activo' ? estilos.activo : estilos.inactivo}>{estado}</span> },
    { clave: 'ultimoAcceso', encabezado: 'Último acceso', renderizar: fecha =>
      fecha ? formatoFecha.format(new Date(fecha)).replaceAll('-', '/') : 'Sin accesos' },
    { clave: 'acciones', encabezado: 'Acciones', renderizar: (_, usuario) => permiteGestionCompleta &&
      <div className={estilos.acciones}>
        <button type="button" disabled={procesando} onClick={() => { establecerErrorAccion(''); establecerMensaje(''); if (alEditar) alEditar(usuario); else establecerFormulario({ usuario }) }} aria-label={`Editar a ${usuario.nombre}`}>Editar</button>
        <button type="button" className={usuario.estado === 'Activo' ? estilos.bloquear : estilos.habilitar} disabled={procesando} onClick={() => alCambiarEstado ? alCambiarEstado(usuario) : cambiarEstado(usuario)}
          aria-label={`${usuario.estado === 'Activo' ? 'Bloquear' : 'Habilitar'} a ${usuario.nombre}`}>
          {usuario.estado === 'Activo' ? 'Bloquear' : 'Habilitar'}
        </button>
        <button type="button" className={estilos.eliminar} disabled={procesando} onClick={() => { establecerErrorAccion(''); establecerMensaje(''); if (alEliminar) alEliminar(usuario); else establecerEliminando(usuario) }} aria-label={`Eliminar a ${usuario.nombre}`}><Trash2 size={16} aria-hidden="true" /></button>
      </div> },
  ]

  return <section className={estilos.pagina} aria-labelledby="titulo-usuarios">
    <div className={estilos.encabezado}>
      <div><h1 id="titulo-usuarios">Gestión de usuarios</h1><p>Administra las cuentas del personal clínico y administrativo con acceso a PsicoCam.</p></div>
      <span className={estilos.contador}>{usuarios.length} usuarios</span>
    </div>
    {mensaje && <p role="status">{mensaje}</p>}
    {errorAccion && !eliminando && <p role="alert">{errorAccion}</p>}
    {cargando ? <p role="status">Cargando usuarios…</p> : error ? <div role="alert">
      <p>{error}</p><button type="button" onClick={() => establecerIntento(valor => valor + 1)}>Reintentar</button>
    </div> : <>
      <section className={estilos.herramientas} aria-labelledby="titulo-plataforma">
        <h2 id="titulo-plataforma">Usuarios de la plataforma</h2>
        <p>Consulta, filtra y administra las cuentas registradas.</p>
        <div className={estilos.controles}>
          <label className={estilos.busqueda} htmlFor="buscar-usuarios">Buscar usuario
            <span><Search size={14} aria-hidden="true" /><input id="buscar-usuarios" type="search"
              placeholder="Buscar por nombre o correo electrónico..." value={busqueda}
              onChange={evento => establecerBusqueda(evento.target.value)} /></span>
          </label>
          <label>Rol<select value={rol} onChange={evento => establecerRol(evento.target.value)}>
            <option value="">Todos</option>{roles.map(opcion => <option key={opcion}>{opcion}</option>)}
          </select></label>
          <label>Estado<select value={estado} onChange={evento => establecerEstado(evento.target.value)}>
            <option value="">Todos</option>{estados.map(opcion => <option key={opcion}>{opcion}</option>)}
          </select></label>
          <button type="button" className={estilos.agregar} disabled={procesando} onClick={() => { establecerErrorAccion(''); establecerMensaje(''); if (alAgregar) alAgregar(); else establecerFormulario({ usuario: null }) }}>
            <Plus size={16} aria-hidden="true" /> Agregar Usuario
          </button>
        </div>
        <p className={estilos.resultados} role="status">Mostrando {usuariosEncontrados.length} de {usuarios.length} usuarios</p>
      </section>
      <PaginaTabla datos={usuariosEncontrados} columnas={columnas} className={estilos.listado} resumenPaginacion
        alSeleccionarFila={establecerUsuarioSeleccionado}
        mensajeVacio={usuarios.length ? 'No hay usuarios que coincidan con la búsqueda y los filtros.' : 'No hay usuarios registrados.'}
        headerTabla={<div className={estilos.tituloTabla}><h2>Listado de usuarios</h2><p>Personal autorizado y estado de acceso a la plataforma.</p></div>} />
    </>}
    {formulario && <FormularioUsuario usuario={formulario.usuario} usuarios={usuarios} alGuardar={guardarUsuario} alCerrar={() => establecerFormulario(null)} />}
    {eliminando && <Modal className="logout-dialog" idTitulo="titulo-eliminar-usuario" alCerrar={() => { if (!procesando) establecerEliminando(null) }}>
      <h2 id="titulo-eliminar-usuario">Eliminar usuario</h2>
      <p>¿Deseas eliminar a {eliminando.nombre}? Esta cuenta se retirará de la lista de usuarios.</p>
      {errorAccion && <p role="alert">{errorAccion}</p>}
      <div className="dialog-actions">
        <button type="button" className="button-secondary" disabled={procesando} onClick={() => establecerEliminando(null)}>Cancelar</button>
        <button type="button" className="button-primary" disabled={procesando} onClick={confirmarEliminacion}>{procesando ? 'Eliminando…' : 'Eliminar usuario'}</button>
      </div>
    </Modal>}
    {usuarioSeleccionado && <ModalDetalleUsuario usuario={usuarioSeleccionado} alCerrar={() => establecerUsuarioSeleccionado(null)} />}
  </section>
}
