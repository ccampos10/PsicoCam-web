import { useState } from 'react'
import Notificacion from '../components/Notificacion'

const EJEMPLOS = {
  exito: {
    titulo: 'Cambios guardados',
    mensaje: 'La configuración se actualizó correctamente.',
  },
  advertencia: {
    titulo: 'Revisa la configuración',
    mensaje: 'Hay cambios sin guardar en el formulario.',
  },
  error: {
    titulo: 'No se pudo guardar',
    mensaje: 'Ocurrió un error al conectar con el servidor.',
  },
  informacion: {
    titulo: 'Nueva alerta registrada',
    mensaje: 'Se recibió una alerta desde el Box 4.',
  },
}

const ETIQUETAS = {
  exito: 'Éxito',
  advertencia: 'Advertencia',
  error: 'Error',
  informacion: 'Información',
}

// Página temporal para validar visualmente SCRUM-658.
export default function DemoNotificacion({ titulo = 'Demo de notificaciones' }) {
  const [notificacion, establecerNotificacion] = useState(null)
  const [clave, establecerClave] = useState(0)

  function mostrar(tipo) {
    establecerNotificacion({ tipo, ...EJEMPLOS[tipo] })
    establecerClave((valor) => valor + 1)
  }

  return (
    <section>
      <h1 className="page-title">{titulo}</h1>
      <div className="placeholder-card">
        <h2>Componente Notificacion</h2>
        <p>
          Selecciona un tipo de alerta para ver la notificación abajo a la derecha.
          Se cierra automáticamente a los 10 segundos o con el botón X.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {Object.keys(EJEMPLOS).map((tipo) => (
            <button
              key={tipo}
              type="button"
              className="button-secondary"
              onClick={() => mostrar(tipo)}
            >
              {ETIQUETAS[tipo]}
            </button>
          ))}
        </div>
      </div>
      {notificacion && (
        <Notificacion
          key={clave}
          {...notificacion}
          alCerrar={() => establecerNotificacion(null)}
        />
      )}
    </section>
  )
}
