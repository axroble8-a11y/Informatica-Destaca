const Certificacion = require('../models/Certificacion');
const { respuestaPaginada, paginacion, esStaff, esAdmin } = require('../utils/helpers');

/** GET /api/certificaciones - staff todo; estudiante ve las suyas */
async function listar(req, res, next) {
  try {
    const { page, limit, skip } = paginacion(req.query, 15);
    const filtro = {};
    if (!esStaff(req.usuario)) {
      if (!req.usuario?.estudiante) return res.json({ ok: true, total: 0, page: 1, pages: 1, datos: [] });
      filtro.estudiante = req.usuario.estudiante;
    } else if (req.query.estudiante) {
      filtro.estudiante = req.query.estudiante;
    }
    if (req.query.estadoPublicacion) filtro.estadoPublicacion = req.query.estadoPublicacion;

    const [total, certificaciones] = await Promise.all([
      Certificacion.countDocuments(filtro),
      Certificacion.find(filtro)
        .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl semestre')
        .sort({ fechaObtencion: -1 })
        .skip(skip)
        .limit(limit),
    ]);
    return respuestaPaginada(res, certificaciones, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** POST /api/certificaciones */
async function crear(req, res, next) {
  try {
    const datos = { ...req.body, propuestoPor: req.usuario._id };
    if (req.usuario.rol === 'estudiante') {
      if (!req.usuario.estudiante || String(datos.estudiante) !== String(req.usuario.estudiante)) {
        return res.status(403).json({ ok: false, mensaje: 'Solo puedes proponer certificaciones de tu propio perfil.' });
      }
      datos.estadoPublicacion = 'pendiente';
    } else {
      datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
    }
    const certificacion = await Certificacion.create(datos);
    res.status(201).json({
      ok: true,
      mensaje:
        certificacion.estadoPublicacion === 'aprobado'
          ? 'Certificación registrada y publicada.'
          : 'Certificación registrada. Queda pendiente de aprobación.',
      dato: certificacion,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/certificaciones/:id */
async function actualizar(req, res, next) {
  try {
    const cert = await Certificacion.findById(req.params.id);
    if (!cert) return res.status(404).json({ ok: false, mensaje: 'Certificación no encontrada.' });

    const staff = esStaff(req.usuario);
    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(cert.estudiante) === String(req.usuario.estudiante);

    if (!staff && !propietario) return res.status(403).json({ ok: false, mensaje: 'Sin permisos para editar esta certificación.' });
    if (propietario && !staff && cert.estadoPublicacion !== 'pendiente') {
      return res.status(403).json({ ok: false, mensaje: 'Solo puedes editar certificaciones pendientes.' });
    }

    ['estudiante', 'nombre', 'institucion', 'fechaObtencion', 'fechaExpiracion', 'urlCredencial'].forEach((c) => {
      if (req.body[c] !== undefined) cert[c] = req.body[c];
    });
    await cert.save();
    res.json({ ok: true, mensaje: 'Certificación actualizada correctamente.', dato: cert });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/certificaciones/:id */
async function eliminar(req, res, next) {
  try {
    const cert = await Certificacion.findById(req.params.id);
    if (!cert) return res.status(404).json({ ok: false, mensaje: 'Certificación no encontrada.' });

    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(cert.estudiante) === String(req.usuario.estudiante);

    if (!esAdmin(req.usuario) && !(propietario && cert.estadoPublicacion === 'pendiente')) {
      return res.status(403).json({ ok: false, mensaje: 'Sin permisos para eliminar esta certificación.' });
    }
    await Certificacion.findByIdAndDelete(cert._id);
    res.json({ ok: true, mensaje: 'Certificación eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, eliminar };
