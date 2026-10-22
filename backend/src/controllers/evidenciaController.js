const Evidencia = require('../models/Evidencia');
const Participacion = require('../models/Participacion');
const Logro = require('../models/Logro');
const { urlDeArchivo, eliminarArchivo } = require('../middlewares/upload');
const { paginacion, respuestaPaginada, esStaff, esAdmin, escaparRegex, idValido } = require('../utils/helpers');

/** GET /api/evidencias - público: galería aprobada y autorizada; staff con ?todos=1 ve todo. Filtros: evento, estudiante, logro, tipo, destacada, q */
async function listar(req, res, next) {
  try {
    const { page, limit, skip } = paginacion(req.query, 12);
    const filtro = {};

    if (esStaff(req.usuario) && req.query.todos === '1') {
      if (req.query.estadoPublicacion) filtro.estadoPublicacion = req.query.estadoPublicacion;
    } else {
      filtro.estadoPublicacion = 'aprobado';
      filtro.autorizadoPublicacion = true;
    }

    if (req.query.evento && idValido(req.query.evento)) filtro.evento = req.query.evento;
    if (req.query.estudiante && idValido(req.query.estudiante)) filtro.estudiante = req.query.estudiante;
    if (req.query.logro && idValido(req.query.logro)) filtro.logro = req.query.logro;
    if (req.query.participacion && idValido(req.query.participacion)) filtro.participacion = req.query.participacion;
    if (req.query.tipo && ['Imagen', 'Video', 'Enlace'].includes(req.query.tipo)) filtro.tipo = req.query.tipo;
    if (req.query.destacada === 'true') filtro.destacada = true;
    if (req.query.q) filtro.titulo = new RegExp(escaparRegex(req.query.q), 'i');

    const [total, evidencias] = await Promise.all([
      Evidencia.countDocuments(filtro),
      Evidencia.find(filtro)
        .populate('evento', 'nombre')
        .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl')
        .populate('logro', 'titulo')
        .sort({ destacada: -1, fecha: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return respuestaPaginada(res, evidencias, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** POST /api/evidencias - multipart/form-data con campo "archivo" opcional */
async function crear(req, res, next) {
  try {
    const body = req.body;
    const datos = {
      titulo: body.titulo,
      descripcion: body.descripcion || '',
      fecha: body.fecha || new Date(),
      tipo: body.tipo,
      urlExterna: body.urlExterna || '',
      evento: body.evento || null,
      estudiante: body.estudiante || null,
      logro: body.logro || null,
      participacion: body.participacion || null,
      autorizadoPublicacion: body.autorizadoPublicacion === 'true' || body.autorizadoPublicacion === true,
      subidoPor: req.usuario._id,
    };

    if (req.file) {
      datos.archivoUrl = urlDeArchivo(req);
      if (!datos.tipo) datos.tipo = req.file.mimetype.startsWith('image/') ? 'Imagen' : 'Video';
    }

    if (!datos.tipo) datos.tipo = datos.urlExterna ? 'Enlace' : 'Imagen';
    if (datos.tipo === 'Enlace' && !datos.urlExterna) {
      return res.status(400).json({ ok: false, mensaje: 'Una evidencia de tipo Enlace requiere una URL externa.' });
    }
    if ((datos.tipo === 'Imagen' || datos.tipo === 'Video') && !datos.archivoUrl && !datos.urlExterna) {
      return res.status(400).json({
        ok: false,
        mensaje: `Una evidencia de tipo ${datos.tipo} requiere un archivo subido o una URL externa (YouTube, Vimeo...).`,
      });
    }

    // Validar que las referencias enviadas pertenezcan al estudiante si es quien propone
    if (req.usuario.rol === 'estudiante') {
      const propio = req.usuario.estudiante && String(datos.estudiante) === String(req.usuario.estudiante);
      let vinculado = propio;
      if (!vinculado && datos.participacion) {
        const p = await Participacion.findById(datos.participacion);
        vinculado = p && req.usuario.estudiante && String(p.estudiante) === String(req.usuario.estudiante);
        if (vinculado) datos.estudiante = req.usuario.estudiante;
      }
      if (!vinculado && datos.logro) {
        const l = await Logro.findById(datos.logro);
        vinculado = l && req.usuario.estudiante && String(l.estudiante) === String(req.usuario.estudiante);
        if (vinculado) datos.estudiante = req.usuario.estudiante;
      }
      if (!vinculado) {
        return res.status(403).json({ ok: false, mensaje: 'Solo puedes vincular evidencias a tu propia trayectoria.' });
      }
      datos.estadoPublicacion = 'pendiente';
      datos.destacada = false;
    } else {
      datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
      datos.destacada = esAdmin(req.usuario) && (body.destacada === 'true' || body.destacada === true);
    }

    if (req.usuario.rol === 'responsable' && !datos.autorizadoPublicacion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes confirmar que el material cuenta con autorización de publicación.',
      });
    }

    const evidencia = await Evidencia.create(datos);
    res.status(201).json({
      ok: true,
      mensaje:
        evidencia.estadoPublicacion === 'aprobado'
          ? 'Evidencia registrada y publicada en la galería.'
          : 'Evidencia registrada. Queda pendiente de revisión y aprobación.',
      dato: evidencia,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/evidencias/:id - datos de texto; para cambiar archivo usar POST con campo reemplazar */
async function actualizar(req, res, next) {
  try {
    const evidencia = await Evidencia.findById(req.params.id);
    if (!evidencia) return res.status(404).json({ ok: false, mensaje: 'Evidencia no encontrada.' });

    const staff = esStaff(req.usuario);
    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      evidencia.estudiante &&
      String(evidencia.estudiante) === String(req.usuario.estudiante);

    if (!staff && !propietario) return res.status(403).json({ ok: false, mensaje: 'Sin permisos para editar esta evidencia.' });
    if (propietario && !staff && evidencia.estadoPublicacion !== 'pendiente') {
      return res.status(403).json({ ok: false, mensaje: 'Solo puedes editar evidencias pendientes.' });
    }

    if (req.file) {
      eliminarArchivo(evidencia.archivoUrl);
      evidencia.archivoUrl = urlDeArchivo(req);
      if (evidencia.tipo !== 'Enlace') evidencia.tipo = req.file.mimetype.startsWith('image/') ? 'Imagen' : 'Video';
    }

    ['titulo', 'descripcion', 'fecha', 'tipo', 'urlExterna', 'evento', 'estudiante', 'logro', 'participacion'].forEach((c) => {
      if (req.body[c] !== undefined) evidencia[c] = req.body[c] || null;
    });
    if (req.body.autorizadoPublicacion !== undefined && staff) {
      evidencia.autorizadoPublicacion = req.body.autorizadoPublicacion === 'true' || req.body.autorizadoPublicacion === true;
    }

    await evidencia.save();
    res.json({ ok: true, mensaje: 'Evidencia actualizada correctamente.', dato: evidencia });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/evidencias/:id/destacada - solo admin */
async function destacar(req, res, next) {
  try {
    const evidencia = await Evidencia.findById(req.params.id);
    if (!evidencia) return res.status(404).json({ ok: false, mensaje: 'Evidencia no encontrada.' });
    evidencia.destacada = !evidencia.destacada;
    await evidencia.save();
    res.json({
      ok: true,
      mensaje: evidencia.destacada ? 'Evidencia destacada en la portada.' : 'Evidencia quitada de destacados.',
      dato: evidencia,
    });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/evidencias/:id - admin o dueño pendiente */
async function eliminar(req, res, next) {
  try {
    const evidencia = await Evidencia.findById(req.params.id);
    if (!evidencia) return res.status(404).json({ ok: false, mensaje: 'Evidencia no encontrada.' });

    const propietario =
      req.usuario.rol === 'estudiante' &&
      req.usuario.estudiante &&
      evidencia.estudiante &&
      String(evidencia.estudiante) === String(req.usuario.estudiante);

    if (!esAdmin(req.usuario) && !(propietario && evidencia.estadoPublicacion === 'pendiente')) {
      return res.status(403).json({ ok: false, mensaje: 'Sin permisos para eliminar esta evidencia.' });
    }

    eliminarArchivo(evidencia.archivoUrl);
    await Evidencia.findByIdAndDelete(evidencia._id);
    res.json({ ok: true, mensaje: 'Evidencia eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, destacar, eliminar };
