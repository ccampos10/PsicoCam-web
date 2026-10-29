import mockData from "./mockData.json";
import usuariosMock from "./usuariosMock.json";
import { Usuario } from "../models/Usuario";

const LATENCIA_MS = 400;
let usuariosActuales = usuariosMock.map((usuario) => new Usuario({ ...usuario, rol: usuario.rol === 'Profesional' ? 'Supervisor' : usuario.rol }));
let siguienteIdUsuario = Math.max(...usuariosActuales.map((usuario) => usuario.id)) + 1;

// Comprueba los datos del perfil y evita correos duplicados.
function validarUsuario(datos, id) {
  if (!datos.nombre?.trim()) throw new Error('Ingresa el nombre completo.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo?.trim() ?? '')) throw new Error('Ingresa un correo válido.');
  if (!['Administrador', 'Supervisor'].includes(datos.rol)) throw new Error('Selecciona un rol válido.');
  if (!['Activo', 'Inactivo'].includes(datos.estado)) throw new Error('Selecciona un estado válido.');
  if (usuariosActuales.some((usuario) => usuario.id !== id && usuario.correo.toLowerCase() === datos.correo.trim().toLowerCase())) {
    throw new Error('Ya existe un usuario con ese correo.');
  }
  if (id === undefined && !datos.contrasena) throw new Error('Ingresa una contraseña.');
}

function simularLatencia(valor) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(valor), LATENCIA_MS);
  });
}

let configuracionActual = {
  horaInicio: "08:00",
  horaTermino: "22:00",
  correoCliente: "atencion.cliente@universidad.cl",
};

export const MockService = {
  // Carga perfiles ficticios para la tabla de usuarios.
  async listarUsuarios() {
    return simularLatencia(usuariosActuales.map((usuario) => new Usuario(usuario)));
  },
  // Simula el registro del perfil; las contraseñas no se almacenan en el mock.
  async crearUsuario(datos) {
    await simularLatencia();
    validarUsuario(datos);
    const usuario = new Usuario({ ...datos, id: siguienteIdUsuario++, nombre: datos.nombre.trim(), correo: datos.correo.trim().toLowerCase(), ultimoAcceso: null });
    usuariosActuales.push(usuario);
    return new Usuario(usuario);
  },
  // Actualiza los datos de una cuenta existente.
  async actualizarUsuario(id, datos) {
    await simularLatencia();
    const indice = usuariosActuales.findIndex((usuario) => usuario.id === id);
    if (indice < 0) throw new Error('El usuario ya no existe.');
    validarUsuario(datos, id);
    usuariosActuales[indice] = new Usuario({ ...datos, id, nombre: datos.nombre.trim(), correo: datos.correo.trim().toLowerCase(), ultimoAcceso: usuariosActuales[indice].ultimoAcceso });
    return new Usuario(usuariosActuales[indice]);
  },
  // Cambia el estado de acceso simulado de una cuenta.
  async cambiarEstadoUsuario(id, estado) {
    await simularLatencia();
    const usuario = usuariosActuales.find((usuario) => usuario.id === id);
    if (!usuario) throw new Error('El usuario ya no existe.');
    if (!['Activo', 'Inactivo'].includes(estado)) throw new Error('Selecciona un estado válido.');
    usuario.estado = estado;
    return new Usuario(usuario);
  },
  // Elimina una cuenta del listado simulado.
  async eliminarUsuario(id) {
    await simularLatencia();
    if (!usuariosActuales.some((usuario) => usuario.id === id)) throw new Error('El usuario ya no existe.');
    usuariosActuales = usuariosActuales.filter((usuario) => usuario.id !== id);
  },
  /**
   * Devuelve la lista de alertas, opcionalmente filtrada.
   * @param {{ box?: string, categoria?: string, nivel?: string, fecha?: string }} filtros
   */
  async listarAlertas(filtros = {}) {
    let resultado = mockData;

    if (filtros.box) {
      resultado = resultado.filter((a) => a.box === filtros.box);
    }
    if (filtros.categoria) {
      resultado = resultado.filter((a) => a.categoria === filtros.categoria);
    }
    if (filtros.nivel) {
      resultado = resultado.filter((a) => a.nivel === filtros.nivel);
    }
    if (filtros.fecha) {
      resultado = resultado.filter((a) => a.fecha === filtros.fecha);
    }

    return simularLatencia(resultado);
  },

  /**
   * Devuelve una alerta por su id, o null si no existe.
   * @param {number} id
   */
  async obtenerAlertaPorId(id) {
    const encontrada = mockData.find((a) => a.id === id) ?? null;
    return simularLatencia(encontrada);
  },

  /**
   * Devuelve conteos totales por nivel de urgencia
   */
  async contarPorNivel() {
    const conteo = { Alto: 0, Medio: 0, Bajo: 0 };
    mockData.forEach((a) => {
      conteo[a.nivel] = (conteo[a.nivel] ?? 0) + 1;
    });
    return simularLatencia(conteo);
  },

  async obtenerConfiguracion() {
    return simularLatencia({ ...configuracionActual });
  },

  async actualizarConfiguracion(nuevaConfiguracion) {
    configuracionActual = { ...configuracionActual, ...nuevaConfiguracion };
    return simularLatencia({ ...configuracionActual });
  },
};
