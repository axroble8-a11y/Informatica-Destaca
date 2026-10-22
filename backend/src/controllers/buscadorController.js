const Estudiante = require('../models/Estudiante');
const Evento = require('../models/Evento');
const Logro = require('../models/Logro');
const Participacion = require('../models/Participacion');
const Evidencia = require('../models/Evidencia');
const { escaparRegex } = require('../utils/helpers');

/** GET /api/busqueda?q= - buscador global público en tiempo real */
async function buscar(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json({ ok: true, consulta: q, estudiantes: [], eventos: [], logros: [] });
    }

    const rx = new RegExp(escaparRegex(q), 'i');

    const [estudiantes, eventos, logros] = await Promise.all([
      Estudiante.find({
        estadoPublicacion: 'aprobado',
        consentimientoPublicacion: true,
        $or: [{ nombre: rx }, { apellidos: rx }, { matricula: rx }],
      })
        .select('nombre apellidos nombreCompleto fotoUrl semestre')
        .limit(8),
      Evento.find({ estadoPublicacion: 'aprobado', $or: [{ nombre: rx }, { descripcion: rx }, { organizador: rx }] })
        .select('nombre categoria estado fechaInicio imagenUrl')
        .limit(8),
      Logro.find({ estadoPublicacion: 'aprobado', $or: [{ titulo: rx }, { descripcion: rx }, { institucion: rx }] })
        .select('titulo categoria tipoReconocimiento fecha institucion')
        .populate('estudiante', 'nombre apellidos nombreCompleto estadoPublicacion consentimientoPublicacion fotoUrl')
        .limit(8),
    ]);

    const logrosVisibles = logros
      .filter((l) => l.estudiante && l.estudiante.estadoPublicacion === 'aprobado' && l.estudiante.consentimientoPublicacion)
      .map((l) => {
        const obj = l.toObject();
        delete obj.estudiante.estadoPublicacion;
        delete obj.estudiante.consentimientoPublicacion;
        return obj;
      });

    res.json({ ok: true, consulta: q, estudiantes, eventos, logros: logrosVisibles });
  } catch (error) {
    next(error);
  }
}

/** GET /api/estadisticas - cifras públicas para la portada */
async function estadisticas(req, res, next) {
  try {
    const [estudiantes, eventos, logros, proximos, galeria] = await Promise.all([
      Estudiante.countDocuments({ estadoPublicacion: 'aprobado', consentimientoPublicacion: true }),
      Evento.countDocuments({ estadoPublicacion: 'aprobado' }),
      Logro.countDocuments({ estadoPublicacion: 'aprobado' }),
      Evento.countDocuments({ estadoPublicacion: 'aprobado', estado: 'proximo' }),
      Evidencia.countDocuments({ estadoPublicacion: 'aprobado', autorizadoPublicacion: true, tipo: 'Imagen' }),
    ]);

    const ultimosLogros = await Logro.find({ estadoPublicacion: 'aprobado' })
      .sort({ fecha: -1 })
      .limit(4)
      .populate('estudiante', 'nombre apellidos nombreCompleto fotoUrl semestre estadoPublicacion consentimientoPublicacion')
      .then((lista) =>
        lista
          .filter((l) => l.estudiante && l.estudiante.estadoPublicacion === 'aprobado' && l.estudiante.consentimientoPublicacion)
          .map((l) => {
            const obj = l.toObject();
            delete obj.estudiante.estadoPublicacion;
            delete obj.estudiante.consentimientoPublicacion;
            return obj;
          })
      );

    const proximosEventos = await Evento.find({ estadoPublicacion: 'aprobado', estado: 'proximo' })
      .sort({ fechaInicio: 1 })
      .limit(3);

    const destacadas = await Evidencia.find({
      estadoPublicacion: 'aprobado',
      autorizadoPublicacion: true,
      tipo: 'Imagen',
      destacada: true,
    })
      .sort({ fecha: -1 })
      .limit(6);

    res.json({ ok: true, cifras: { estudiantes, eventos, logros, proximos, galeria }, ultimosLogros, proximosEventos, destacadas });
  } catch (error) {
    next(error);
  }
}

/** GET /api/catalogos - valores de catálogos para formularios */
async function catalogos(req, res, next) {
  try {
    const semestres = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Egresado', 'Titulado'];
    const niveles = ['Básico', 'Intermedio', 'Avanzado'];
    const estudiante = await Estudiante.findOne({ estadoPublicacion: 'aprobado', consentimientoPublicacion: true }).select('_id');

    res.json({
      ok: true,
      catalogos: {
        semestres,
        nivelesHabilidad: niveles,
        modalidades: Evento.schema.path('modalidad').enumValues,
        categoriasEvento: Evento.schema.path('categoria').enumValues,
        estadosEvento: Evento.schema.path('estado').enumValues,
        tiposParticipacion: Participacion.schema.path('tipo').enumValues,
        categoriasLogro: Logro.schema.path('categoria').enumValues,
        tiposReconocimiento: Logro.schema.path('tipoReconocimiento').enumValues,
        tiposEvidencia: Evidencia.schema.path('tipo').enumValues,
        estadosPublicacion: ['pendiente', 'aprobado', 'rechazado'],
        roles: ['administrador', 'responsable', 'estudiante'],
        ejemploEstudiante: estudiante ? estudiante._id : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { buscar, estadisticas, catalogos };
