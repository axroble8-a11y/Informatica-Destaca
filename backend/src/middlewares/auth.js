const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Usuario = require('../models/Usuario');

/** Verifica el token JWT y adjunta el usuario a la petición. */
async function proteger(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado. Inicia sesión para continuar.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return res.status(401).json({ ok: false, mensaje: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' });
    }

    const usuario = await Usuario.findById(payload.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'La cuenta no existe o está desactivada.' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

/** Resuelve el usuario si la petición trae un token válido; nunca bloquea el acceso público. */
async function usuarioOpcional(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const payload = jwt.verify(header.slice(7), config.jwt.secret);
      const usuario = await Usuario.findById(payload.id);
      if (usuario && usuario.activo) req.usuario = usuario;
    }
  } catch {
    /* token ausente o inválido: continúa como visitante público */
  }
  next();
}

/** Restringe el acceso a los roles indicados. Uso: autorizar('administrador', 'responsable') */
function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado.' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes permisos para realizar esta acción.',
      });
    }
    next();
  };
}

module.exports = { proteger, autorizar, usuarioOpcional };
