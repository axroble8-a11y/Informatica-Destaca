const { validationResult } = require('express-validator');

/** Middleware que procesa el resultado de express-validator. */
function validarCampos(req, res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) return next();

  const detalles = errores.array().map((e) => ({
    campo: e.path,
    mensaje: e.msg,
  }));

  return res.status(400).json({
    ok: false,
    mensaje: 'Datos inválidos. Revisa los campos marcados.',
    errores: detalles,
  });
}

module.exports = { validarCampos };
