import { api, obtenerToken, guardarToken, borrarToken } from './api.js';

const SESION_KEY = 'idestaca_usuario';

export const sesion = {
  usuario: null,
};

/** Restaura la sesión almacenada y valida el token con el backend. */
export async function cargarSesion() {
  const guardada = localStorage.getItem(SESION_KEY);
  if (guardada) {
    try {
      sesion.usuario = JSON.parse(guardada);
    } catch {
      sesion.usuario = null;
    }
  }
  if (!obtenerToken()) {
    cerrarSesionLocal();
    return null;
  }
  try {
    const res = await api.get('/auth/me');
    sesion.usuario = res.usuario;
    localStorage.setItem(SESION_KEY, JSON.stringify(res.usuario));
    return res.usuario;
  } catch (err) {
    if (err.status === 401) {
      cerrarSesionLocal();
    }
    return null;
  }
}

export async function iniciarSesion(email, password) {
  const res = await api.post('/auth/login', { email, password });
  guardarToken(res.token);
  sesion.usuario = res.usuario;
  localStorage.setItem(SESION_KEY, JSON.stringify(res.usuario));
  return res.usuario;
}

export async function registrarCuenta(datos) {
  const res = await api.post('/auth/registro', datos);
  guardarToken(res.token);
  sesion.usuario = res.usuario;
  localStorage.setItem(SESION_KEY, JSON.stringify(res.usuario));
  return res.usuario;
}

export function cerrarSesionLocal() {
  borrarToken();
  localStorage.removeItem(SESION_KEY);
  sesion.usuario = null;
}

export function estaAutenticado() {
  return !!sesion.usuario && !!obtenerToken();
}

export function esStaff() {
  return !!sesion.usuario && ['administrador', 'responsable'].includes(sesion.usuario.rol);
}

export function esAdmin() {
  return !!sesion.usuario && sesion.usuario.rol === 'administrador';
}

export function esEstudiante() {
  return !!sesion.usuario && sesion.usuario.rol === 'estudiante';
}

export function rolEtiqueta(rol) {
  return { administrador: 'Administrador', responsable: 'Responsable de contenido', estudiante: 'Estudiante' }[rol] || rol;
}
