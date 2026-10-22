const Proyecto = require('../models/Proyecto');
const { respuestaPaginada, paginacion, esStaff, esAdmin } = require('../utils/helpers');

/** GET /api/proyectos - staff todo; estudiante ve los suyos */
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

    const [total, proyectos] = await Promise.all([
      Proyecto.countDocuments(filtro),
      Proyecto.find(filtro)
        .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl semestre')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);
    return respuestaPaginada(res, proyectos, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** POST /api/proyectos */
async function crear(req, res, next) {
  try {
    const datos = { ...req.body, propuestoPor: req.usuario._id };
    if (req.usuario.rol === 'estudiante') {
      if (!req.usuario.estudiante || String(datos.estudiante) !== String(req.usuario.estudiante)) {
        return res.status(403).json({ ok: false, mensaje: 'Solo puedes proponer proyectos de tu propio perfil.' });
      }
      datos.estadoPublicacion = 'pendiente';
    } else {
      datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
    }
    const proyecto = await Proyecto.create(datos);
    res.status(201).json({
      ok: true,
      mensaje: proyecto.estadoPublicacion === 'aprobado' ? 'Proyecto registrado y publicado.' : 'Proyecto registrado. Queda pendiente de aprobación.',
      dato: proyecto,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/proyectos/:id */
async function actualizar(req, res, next) {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ ok: false, mensaje: 'Proyecto no encontrado.' });

    const staff = esStaff(req.usuario);
    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(proyecto.estudiante) === String(req.usuario.estudiante);

    if (!staff && !propietario) return res.status(403).json({ ok: false, mensaje: 'Sin permisos para editar este proyecto.' });
    if (propietario && !staff && proyecto.estadoPublicacion !== 'pendiente') {
      return res.status(403).json({ ok: false, mensaje: 'Solo puedes editar proyectos pendientes.' });
    }

    ['estudiante', 'nombre', 'descripcion', 'tecnologias', 'fechaInicio', 'fechaFin', 'urlRepositorio', 'urlDemo'].forEach((c) => {
      if (req.body[c] !== undefined) proyecto[c] = req.body[c];
    });
    await proyecto.save();
    res.json({ ok: true, mensaje: 'Proyecto actualizado correctamente.', dato: proyecto });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/proyectos/:id */
async function eliminar(req, res, next) {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ ok: false, mensaje: 'Proyecto no encontrado.' });

    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(proyecto.estudiante) === String(req.usuario.estudiante);

    if (!esAdmin(req.usuario) && !(propietario && proyecto.estadoPublicacion === 'pendiente')) {
      return res.status(403).json({ ok: false, mensaje: 'Sin permisos para eliminar este proyecto.' });
    }
    await Proyecto.findByIdAndDelete(proyecto._id);
    res.json({ ok: true, mensaje: 'Proyecto eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, eliminar };
