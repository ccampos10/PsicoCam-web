import { X } from 'lucide-react'
import Modal from './Modal'
import estilos from './ModalDetalleUsuario.module.css'

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

export default function ModalDetalleUsuario({ usuario, alCerrar }) {
  if (!usuario) return null

  return <Modal className={estilos.modal} idTitulo="titulo-detalle-usuario" alCerrar={alCerrar}>
    <header className={estilos.encabezado}>
      <h2 id="titulo-detalle-usuario">Detalle de usuario</h2>
      <p>Consulta la información de la cuenta y su acceso a PsicoCam.</p>
      <button type="button" className={estilos.cerrarIcono} aria-label="Cerrar detalle de usuario" onClick={alCerrar}>
        <X size={20} aria-hidden="true" />
      </button>
    </header>
    <dl className={estilos.datos}>
      <div className={estilos.anchoCompleto}><dt>Nombre completo</dt><dd>{usuario.nombre}</dd></div>
      <div className={estilos.anchoCompleto}><dt>Correo electrónico</dt><dd>{usuario.correo}</dd></div>
      <div><dt>Rol de acceso</dt><dd>{usuario.rol}</dd></div>
      <div><dt>Estado</dt><dd><span className={usuario.estado === 'Activo' ? estilos.activo : estilos.inactivo}>{usuario.estado}</span></dd></div>
      <div className={estilos.anchoCompleto}><dt>Último acceso</dt><dd>
        {usuario.ultimoAcceso ? formatoFecha.format(new Date(usuario.ultimoAcceso)).replaceAll('-', '/') : 'Sin accesos'}
      </dd></div>
    </dl>
    <footer className={estilos.pie}>
      <button type="button" className={estilos.cerrar} onClick={alCerrar}>Cerrar</button>
    </footer>
  </Modal>
}
