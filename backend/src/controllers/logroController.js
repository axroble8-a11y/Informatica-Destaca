const Logro = require('../models/Logro');
const Evidencia = require('../models/Evidencia');
const { paginacion, respuestaPaginada, esStaff, esAdmin, escaparRegex, idValido } = require('../utils/helpers');

/** GET /api/logros - público: cuadro de honor con filtros; staff con ?todos=1 ve todo */
async function listar(req, res, next) {
  try {
    const { page, limit, skip } = paginacion(req.query, 12);
    const filtro = {};

    if (esStaff(req.usuario) && req.query.todos === '1') {
      if (req.query.estadoPublicacion) filtro.estadoPublicacion = req.query.estadoPublicacion;
    } else {
      filtro.estadoPublicacion = 'aprobado';
    }

    if (req.query.q) {
      const rx = new RegExp(escaparRegex(req.query.q), 'i');
      filtro.$or = [{ titulo: rx }, { descripcion: rx }, { institucion: rx }];
    }
    if (req.query.categoria) filtro.categoria = req.query.categoria;
    if (req.query.tipo) filtro.tipoReconocimiento = req.query.tipo;
    if (req.query.destacado === 'true') filtro.destacado = true;
    if (req.query.estudiante) filtro.estudiante = req.query.estudiante;

    if (req.query.desde || req.query.hasta) {
      filtro.fecha = {};
      if (req.query.desde) filtro.fecha.$gte = new Date(req.query.desde);
      if (req.query.hasta) {
        const hasta = new Date(req.query.hasta);
        hasta.setHours(23, 59, 59, 999);
        filtro.fecha.$lte = hasta;
      }
    }

    const [total, logros] = await Promise.all([
      Logro.countDocuments(filtro),
      Logro.find(filtro)
        .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl semestre estadoPublicacion consentimientoPublicacion')
        .populate('evento', 'nombre categoria')
        .sort({ destacado: -1, fecha: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const visibles = logros.filter(
      (l) =>
        esStaff(req.usuario) ||
        (l.estudiante && l.estudiante.estadoPublicacion === 'aprobado' && l.estudiante.consentimientoPublicacion)
    );

    return respuestaPaginada(res, visibles, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** GET /api/logros/:id - detalle público con evidencias aprobadas */
async function obtener(req, res, next) {
  try {
    if (!idValido(req.params.id)) return res.status(400).json({ ok: false, mensaje: 'Identificador inválido.' });

    const logro = await Logro.findById(req.params.id)
      .populate('estudiante')
      .populate('evento', 'nombre categoria estado');
    if (!logro) return res.status(404).json({ ok: false, mensaje: 'Logro no encontrado.' });

    const staff = esStaff(req.usuario);
    const visible =
      logro.estadoPublicacion === 'aprobado' &&
      logro.estudiante &&
      logro.estudiante.estadoPublicacion === 'aprobado' &&
      logro.estudiante.consentimientoPublicacion;

    if (!visible && !staff) {
      return res.status(403).json({ ok: false, mensaje: 'Este logro no está publicado actualmente.' });
    }

    const evidencias = await Evidencia.find({
      logro: logro._id,
      estadoPublicacion: 'aprobado',
      autorizadoPublicacion: true,
    }).sort({ fecha: -1 });

    res.json({ ok: true, dato: logro, evidencias });
  } catch (error) {
    next(error);
  }
}

/** POST /api/logros - estudiante propone el suyo; responsable propone; admin publica */
async function crear(req, res, next) {
  try {
    const datos = { ...req.body, propuestoPor: req.usuario._id };

    if (req.usuario.rol === 'estudiante') {
      if (!req.usuario.estudiante || String(datos.estudiante) !== String(req.usuario.estudiante)) {
        return res.status(403).json({ ok: false, mensaje: 'Solo puedes proponer logros de tu propio historial.' });
      }
      datos.estadoPublicacion = 'pendiente';
      datos.destacado = false;
    } else {
      datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
      if (!esAdmin(req.usuario)) datos.destacado = false;
    }

    const logro = await Logro.create(datos);
    res.status(201).json({
      ok: true,
      mensaje:
        logro.estadoPublicacion === 'aprobado'
          ? 'Logro registrado y publicado.'
          : 'Logro registrado. Queda pendiente de aprobación.',
      dato: logro,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/logros/:id - staff; dueño solo mientras esté pendiente */
async function actualizar(req, res, next) {
  try {
    const logro = await Logro.findById(req.params.id);
    if (!logro) return res.status(404).json({ ok: false, mensaje: 'Logro no encontrado.' });

    const staff = esStaff(req.usuario);
    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(logro.estudiante) === String(req.usuario.estudiante);

    if (!staff && !propietario) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para editar este logro.' });
    }
    if (propietario && !staff && logro.estadoPublicacion !== 'pendiente') {
      return res.status(403).json({ ok: false, mensaje: 'Solo puedes editar logros que siguen pendientes.' });
    }

    const campos = [
      'estudiante',
      'titulo',
      'categoria',
      'tipoReconocimiento',
      'descripcion',
      'fecha',
      'evento',
      'institucion',
    ];
    campos.forEach((c) => {
      if (req.body[c] !== undefined) logro[c] = req.body[c];
    });
    if (esAdmin(req.usuario) && req.body.destacado !== undefined) logro.destacado = !!req.body.destacado;

    await logro.save();
    res.json({ ok: true, mensaje: 'Logro actualizado correctamente.', dato: logro });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/logros/:id - admin o dueño pendiente */
async function eliminar(req, res, next) {
  try {
    const logro = await Logro.findById(req.params.id);
    if (!logro) return res.status(404).json({ ok: false, mensaje: 'Logro no encontrado.' });

    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      String(logro.estudiante) === String(req.usuario.estudiante);

    if (!esAdmin(req.usuario) && !(propietario && logro.estadoPublicacion === 'pendiente')) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para eliminar este logro.' });
    }

    await Evidencia.deleteMany({ logro: logro._id });
    await Logro.findByIdAndDelete(logro._id);
    res.json({ ok: true, mensaje: 'Logro eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
