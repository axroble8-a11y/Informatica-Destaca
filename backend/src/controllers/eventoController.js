const Evento = require('../models/Evento');
const Participacion = require('../models/Participacion');
const Evidencia = require('../models/Evidencia');
const { paginacion, respuestaPaginada, esStaff, esAdmin, escaparRegex, idValido } = require('../utils/helpers');

/** GET /api/eventos - público con filtros: q, estado, categoria, desde, hasta; staff con ?todos=1 ve todo */
async function listar(req, res, next) {
  try {
    const { page, limit, skip } = paginacion(req.query);
    const filtro = {};

    if (esStaff(req.usuario) && req.query.todos === '1') {
      if (req.query.estadoPublicacion) filtro.estadoPublicacion = req.query.estadoPublicacion;
    } else {
      filtro.estadoPublicacion = 'aprobado';
    }

    if (req.query.q) {
      const rx = new RegExp(escaparRegex(req.query.q), 'i');
      filtro.$or = [{ nombre: rx }, { descripcion: rx }, { organizador: rx }];
    }
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.categoria) filtro.categoria = req.query.categoria;

    if (req.query.desde || req.query.hasta) {
      filtro.fechaInicio = {};
      if (req.query.desde) filtro.fechaInicio.$gte = new Date(req.query.desde);
      if (req.query.hasta) {
        const hasta = new Date(req.query.hasta);
        hasta.setHours(23, 59, 59, 999);
        filtro.fechaInicio.$lte = hasta;
      }
    }

    const orden = req.query.orden === 'asc' ? 1 : -1;
    const [total, eventos] = await Promise.all([
      Evento.countDocuments(filtro),
      Evento.find(filtro)
        .sort({ fechaInicio: orden })
        .skip(skip)
        .limit(limit)
        .populate('creadoPor', 'nombre'),
    ]);

    const eventosConConteo = await Promise.all(
      eventos.map(async (ev) => {
        const participantes = await Participacion.countDocuments({
          evento: ev._id,
          estadoPublicacion: 'aprobado',
        });
        const datos = ev.toObject();
        datos.totalParticipantes = participantes;
        return datos;
      })
    );

    return respuestaPaginada(res, eventosConConteo, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** GET /api/eventos/:id - detalle con participantes y galería aprobados */
async function obtener(req, res, next) {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({ ok: false, mensaje: 'Identificador inválido.' });
    }
    const evento = await Evento.findById(req.params.id).populate('creadoPor', 'nombre');
    if (!evento) return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado.' });

    if (evento.estadoPublicacion !== 'aprobado' && !esStaff(req.usuario)) {
      return res.status(403).json({ ok: false, mensaje: 'Este evento no está publicado actualmente.' });
    }

    const [participaciones, evidencias] = await Promise.all([
      Participacion.find({ evento: evento._id, estadoPublicacion: 'aprobado' })
        .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl semestre estadoPublicacion consentimientoPublicacion')
        .sort({ fecha: -1 }),
      Evidencia.find({ evento: evento._id, estadoPublicacion: 'aprobado', autorizadoPublicacion: true }).sort({ fecha: -1 }),
    ]);

    res.json({
      ok: true,
      dato: evento,
      participaciones: participaciones.filter(
        (p) => p.estudiante && p.estudiante.estadoPublicacion === 'aprobado' && p.estudiante.consentimientoPublicacion
      ),
      evidencias,
    });
  } catch (error) {
    next(error);
  }
}

/** POST /api/eventos - responsable propone (pendiente), admin publica directo */
async function crear(req, res, next) {
  try {
    const datos = { ...req.body, creadoPor: req.usuario._id };
    datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
    const evento = await Evento.create(datos);
    res.status(201).json({
      ok: true,
      mensaje:
        evento.estadoPublicacion === 'aprobado'
          ? 'Evento registrado y publicado.'
          : 'Evento registrado. Queda pendiente de aprobación para publicarse.',
      dato: evento,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/eventos/:id - staff */
async function actualizar(req, res, next) {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado.' });

    const campos = [
      'nombre',
      'descripcion',
      'fechaInicio',
      'fechaFin',
      'horario',
      'modalidad',
      'lugar',
      'organizador',
      'categoria',
      'imagenUrl',
      'estado',
    ];
    campos.forEach((c) => {
      if (req.body[c] !== undefined) evento[c] = req.body[c];
    });

    await evento.save();
    res.json({ ok: true, mensaje: 'Evento actualizado correctamente.', dato: evento });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/eventos/:id/estado - staff: próximo | realizado | cancelado */
async function cambiarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    if (!['proximo', 'realizado', 'cancelado'].includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: 'Estado no válido.' });
    }
    const evento = await Evento.findByIdAndUpdate(req.params.id, { estado }, { new: true, runValidators: true });
    if (!evento) return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado.' });
    res.json({ ok: true, mensaje: `Evento marcado como "${estado}".`, dato: evento });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/eventos/:id - solo administrador */
async function eliminar(req, res, next) {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id);
    if (!evento) return res.status(404).json({ ok: false, mensaje: 'Evento no encontrado.' });

    await Promise.all([
      Participacion.deleteMany({ evento: evento._id }),
      Evidencia.deleteMany({ evento: evento._id }),
    ]);

    res.json({ ok: true, mensaje: 'Evento eliminado junto con sus participaciones y evidencias.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, eliminar };
