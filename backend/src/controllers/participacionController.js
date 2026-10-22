const Participacion = require('../models/Participacion');
const Evidencia = require('../models/Evidencia');
const { paginacion, respuestaPaginada, esStaff, esAdmin, idValido } = require('../utils/helpers');

/** GET /api/participaciones - staff ve todo; estudiante ve las suyas */
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

    if (req.query.evento) filtro.evento = req.query.evento;
    if (req.query.tipo) filtro.tipo = req.query.tipo;
    if (req.query.estadoPublicacion) filtro.estadoPublicacion = req.query.estadoPublicacion;

    const [total, participaciones] = await Promise.all([
      Participacion.countDocuments(filtro),
      Participacion.find(filtro)
        .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl semestre')
        .populate('evento', 'nombre categoria estado')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return respuestaPaginada(res, participaciones, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** POST /api/participaciones - estudiante propone la suya; responsable propone; admin publica */
async function crear(req, res, next) {
  try {
    const datos = { ...req.body, propuestoPor: req.usuario._id };

    if (req.usuario.rol === 'estudiante') {
      if (!req.usuario.estudiante || String(datos.estudiante) !== String(req.usuario.estudiante)) {
        return res.status(403).json({ ok: false, mensaje: 'Solo puedes proponer participaciones en tu propio historial.' });
      }
      datos.estadoPublicacion = 'pendiente';
    } else {
      datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
    }

    const participacion = await Participacion.create(datos);
    res.status(201).json({
      ok: true,
      mensaje:
        participacion.estadoPublicacion === 'aprobado'
          ? 'Participación registrada y publicada en el historial del estudiante.'
          : 'Participación registrada. Queda pendiente de aprobación.',
      dato: participacion,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/participaciones/:id - staff; el estudiante propietario solo si sigue pendiente */
async function actualizar(req, res, next) {
  try {
    const participacion = await Participacion.findById(req.params.id);
    if (!participacion) return res.status(404).json({ ok: false, mensaje: 'Participación no encontrada.' });

    const staff = esStaff(req.usuario);
    const propietaria =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(participacion.estudiante) === String(req.usuario.estudiante);

    if (!staff && !propietaria) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para editar esta participación.' });
    }
    if (propietaria && !staff && participacion.estadoPublicacion !== 'pendiente') {
      return res.status(403).json({ ok: false, mensaje: 'Solo puedes editar participaciones que siguen pendientes.' });
    }

    const campos = ['estudiante', 'evento', 'actividadLibre', 'fecha', 'tipo', 'descripcion', 'resultado'];
    campos.forEach((c) => {
      if (req.body[c] !== undefined) participacion[c] = req.body[c];
    });

    await participacion.save();
    res.json({ ok: true, mensaje: 'Participación actualizada correctamente.', dato: participacion });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/participaciones/:id - admin, o dueño si está pendiente */
async function eliminar(req, res, next) {
  try {
    const participacion = await Participacion.findById(req.params.id);
    if (!participacion) return res.status(404).json({ ok: false, mensaje: 'Participación no encontrada.' });

    const propietaria =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(participacion.estudiante) === String(req.usuario.estudiante);

    if (!esAdmin(req.usuario) && !(propietaria && participacion.estadoPublicacion === 'pendiente')) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para eliminar esta participación.' });
    }

    await Evidencia.deleteMany({ participacion: participacion._id });
    await Participacion.findByIdAndDelete(participacion._id);
    res.json({ ok: true, mensaje: 'Participación eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, eliminar };
