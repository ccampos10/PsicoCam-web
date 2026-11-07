export function metadatosEvento(registro) {
  const accion = String(registro.accion || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll(' ', '_')
  const clinico = /clasificar_alerta|evaluar_alerta|alerta_generada|crear_alerta|deteccion/.test(accion)
  const tecnico = /notificacion|correo|integracion|contingencia|conexion/.test(accion)
  const sistema = /sesion|login|logout|usuario|configuracion|horario|servicio/.test(accion)
  const tipo = registro.tipo || (clinico ? /clasificar|evaluar/.test(accion) ? 'Atención clínica' : 'Alerta clínica' : tecnico ? /notificacion|correo/.test(accion) ? 'Notificación' : 'Integración' : sistema ? /configuracion|horario/.test(accion) ? 'Configuración' : 'Sistema' : 'Sin categoría')
  return { tipo, resultado: registro.resultado || (/clasificar_alerta|evaluar_alerta/.test(accion) ? 'Evaluado' : /error|fallo/.test(accion) ? 'Fallido' : 'No registrado'), categoria: clinico ? 'clinico' : tecnico ? 'tecnico' : sistema ? 'sistema' : 'sinCategoria' }
}
