/**
 * Cliente HTTP de la API con soporte JWT.
 * Detecta automáticamente el origen del backend:
 *  - Mismo origen cuando el backend sirve el frontend (http://localhost:4000)
 *  - Backend en :4000 cuando el frontend corre aislado con `npm start` (:5500)
 */
export const API_BASE =
  window.location.port === '5500' ? 'http://localhost:4000' : '';

const TOKEN_KEY = 'idestaca_token';

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function guardarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function borrarToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(mensaje, status, errores) {
    super(mensaje);
    this.status = status;
    this.errores = errores || [];
  }
}

async function peticion(ruta, { metodo = 'GET', cuerpo, formData, token } = {}) {
  const cabeceras = {};

  if (token ?? obtenerToken()) {
    cabeceras.Authorization = `Bearer ${token ?? obtenerToken()}`;
  }
  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: formData ? formData : cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (err) {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.', 0);
  }

  let datos = {};
  try {
    datos = await res.json();
  } catch {
    /* respuesta sin cuerpo */
  }

  if (!res.ok) {
    throw new ApiError(datos.mensaje || `Error ${res.status}`, res.status, datos.errores);
  }
  return datos;
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) => peticion(ruta, { metodo: 'POST', cuerpo }),
  postForm: (ruta, formData) => peticion(ruta, { metodo: 'POST', formData }),
  put: (ruta, cuerpo) => peticion(ruta, { metodo: 'PUT', cuerpo }),
  putForm: (ruta, formData) => peticion(ruta, { metodo: 'PUT', formData }),
  patch: (ruta, cuerpo) => peticion(ruta, { metodo: 'PATCH', cuerpo }),
  delete: (ruta) => peticion(ruta, { metodo: 'DELETE' }),
};

/** Normaliza las rutas públicas de imágenes y archivos subidos. */
export function urlAbsoluta(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  if (url.startsWith('/img/')) return `/public${url}`;
  return url;
}

/** Cache simple de catálogos (enums del backend). */
let cacheCatalogos = null;
export async function obtenerCatalogos(forzar = false) {
  if (cacheCatalogos && !forzar) return cacheCatalogos;
  const res = await api.get('/catalogos');
  cacheCatalogos = res.catalogos;
  return cacheCatalogos;
}
