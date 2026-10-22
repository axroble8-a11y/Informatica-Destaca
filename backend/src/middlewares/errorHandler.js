const multer = require('multer');
const mongoose = require('mongoose');

function noEncontrado(req, res) {
  res.status(404).json({ ok: false, mensaje: 'Recurso no encontrado.' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  console.error(`[error] ${req.method} ${req.originalUrl} -> ${err.message}`);

  if (err instanceof multer.MulterError) {
    const mensajes = {
      LIMIT_FILE_SIZE: 'El archivo excede el tamaño máximo permitido.',
      LIMIT_UNEXPECTED_FILE: 'Campo de archivo no esperado.',
    };
    return res.status(400).json({ ok: false, mensaje: mensajes[err.code] || 'Error al subir el archivo.' });
  }

  if (err.message && err.message.includes('Formato no permitido')) {
    return res.status(400).json({ ok: false, mensaje: err.message });
  }
  if (err.message && err.message.includes('tamaño máximo')) {
    return res.status(400).json({ ok: false, mensaje: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errores = Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos.', errores });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ ok: false, mensaje: 'Identificador inválido.' });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({ ok: false, mensaje: `Ya existe un registro con ese ${campo}.` });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'JSON malformado en la petición.' });
  }

  res.status(err.status || 500).json({
    ok: false,
    mensaje: err.status ? err.message : 'Error interno del servidor.',
  });
}

module.exports = { noEncontrado, errorHandler };
