/** Utilidades compartidas por los controladores. */

/** Normaliza paginación desde query params. */
function paginacion(query, defaultLimit = 12) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(60, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Construye la respuesta paginada estándar. */
function respuestaPaginada(res, items, total, page, limit, extra = {}) {
  return res.json({
    ok: true,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    ...extra,
    datos: items,
  });
}

/** Indica si el usuario autenticado es personal (admin o responsable). */
function esStaff(usuario) {
  return !!usuario && ['administrador', 'responsable'].includes(usuario.rol);
}

/** Indica si el usuario autenticado es administrador. */
function esAdmin(usuario) {
  return !!usuario && usuario.rol === 'administrador';
}

/** El usuario autenticado corresponde al estudiante indicado. */
async function esPropietarioEstudiante(usuario, estudianteId) {
  if (!usuario || usuario.rol !== 'estudiante' || !usuario.estudiante) return false;
  return String(usuario.estudiante) === String(estudianteId);
}

/** Lista de ids válidos de ObjectId; descarta nulos y vacíos. */
function idValido(id) {
  return !!id && /^[0-9a-fA-F]{24}$/.test(String(id));
}

/** Cadena segura para regex de búsqueda (escapa caracteres especiales). */
function escaparRegex(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  paginacion,
  respuestaPaginada,
  esStaff,
  esAdmin,
  esPropietarioEstudiante,
  idValido,
  escaparRegex,
};
