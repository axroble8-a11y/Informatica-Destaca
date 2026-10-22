const Estudiante = require('../models/Estudiante');
const Participacion = require('../models/Participacion');
const Logro = require('../models/Logro');
const Proyecto = require('../models/Proyecto');
const Certificacion = require('../models/Certificacion');
const Evidencia = require('../models/Evidencia');
const { paginacion, respuestaPaginada, esStaff, esAdmin, escaparRegex } = require('../utils/helpers');

/** Campos que un estudiante puede proponer sobre su propio perfil. */
const CAMPOS_PROPIETARIO = [
  'fotoUrl',
  'perfilProfesional',
  'areasInteres',
  'habilidades',
  'correoContacto',
  'githubUrl',
  'linkedinUrl',
  'sitioWebUrl',
];

/** GET /api/estudiantes - público: perfiles aprobados y con consentimiento; staff con ?todos=1 ve todo */
async function listar(req, res, next) {
  try {
    const { page, limit, skip } = paginacion(req.query);
    const filtro = {};

    if (esStaff(req.usuario) && req.query.todos === '1') {
      if (req.query.estadoPublicacion) filtro.estadoPublicacion = req.query.estadoPublicacion;
    } else {
      filtro.estadoPublicacion = 'aprobado';
      filtro.consentimientoPublicacion = true;
    }

    if (req.query.q) {
      const rx = new RegExp(escaparRegex(req.query.q), 'i');
      filtro.$or = [{ nombre: rx }, { apellidos: rx }, { matricula: rx }];
    }
    if (req.query.semestre) filtro.semestre = req.query.semestre;

    const sort = req.query.orden === 'nombre' ? { nombre: 1, apellidos: 1 } : { createdAt: -1 };

    const [total, estudiantes] = await Promise.all([
      Estudiante.countDocuments(filtro),
      Estudiante.find(filtro).sort(sort).skip(skip).limit(limit),
    ]);

    return respuestaPaginada(res, estudiantes, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/** GET /api/estudiantes/:id - perfil completo con trayectoria aprobada */
async function obtener(req, res, next) {
  try {
    const estudiante = await Estudiante.findById(req.params.id);
    if (!estudiante) return res.status(404).json({ ok: false, mensaje: 'Estudiante no encontrado.' });

    const staff = esStaff(req.usuario);
    const propietario =
      req.usuario && req.usuario.estudiante && String(req.usuario.estudiante) === String(estudiante._id);
    const visible = estudiante.estadoPublicacion === 'aprobado' && estudiante.consentimientoPublicacion;

    if (!visible && !staff && !propietario) {
      return res.status(403).json({ ok: false, mensaje: 'Este perfil no está publicado actualmente.' });
    }

    const soloAprobados = staff || propietario ? {} : { estadoPublicacion: 'aprobado' };

    const [participaciones, logros, proyectos, certificaciones, evidencias] = await Promise.all([
      Participacion.find({ estudiante: estudiante._id, ...soloAprobados })
        .populate('evento', 'nombre categoria estado fechaInicio')
        .sort({ fecha: -1 }),
      Logro.find({ estudiante: estudiante._id, ...soloAprobados }).sort({ fecha: -1 }),
      Proyecto.find({ estudiante: estudiante._id, ...soloAprobados }).sort({ createdAt: -1 }),
      Certificacion.find({ estudiante: estudiante._id, ...soloAprobados }).sort({ fechaObtencion: -1 }),
      Evidencia.find({ estudiante: estudiante._id, estadoPublicacion: 'aprobado', autorizadoPublicacion: true }).sort({
        fecha: -1,
      }),
    ]);

    res.json({
      ok: true,
      dato: estudiante,
      trayectoria: { participaciones, logros, proyectos, certificaciones, evidencias },
    });
  } catch (error) {
    next(error);
  }
}

/** POST /api/estudiantes - staff (responsable propone pendiente, admin aprueba directo) */
async function crear(req, res, next) {
  try {
    const datos = { ...req.body };
    datos.estadoPublicacion = esAdmin(req.usuario) ? 'aprobado' : 'pendiente';
    const estudiante = await Estudiante.create(datos);
    res.status(201).json({
      ok: true,
      mensaje:
        estudiante.estadoPublicacion === 'aprobado'
          ? 'Estudiante registrado y publicado.'
          : 'Estudiante registrado. Queda pendiente de aprobación.',
      dato: estudiante,
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/estudiantes/:id - staff edita todo; el estudiante propietario propone cambios limitados */
async function actualizar(req, res, next) {
  try {
    const estudiante = await Estudiante.findById(req.params.id);
    if (!estudiante) return res.status(404).json({ ok: false, mensaje: 'Estudiante no encontrado.' });

    const staff = esStaff(req.usuario);
    const propietario =
      req.usuario && req.usuario.rol === 'estudiante' && String(req.usuario.estudiante) === String(estudiante._id);

    if (!staff && !propietario) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para editar este perfil.' });
    }

    if (staff) {
      const campos = [
        'nombre',
        'apellidos',
        'matricula',
        'semestre',
        'generacion',
        'fotoUrl',
        'perfilProfesional',
        'areasInteres',
        'habilidades',
        'correoContacto',
        'githubUrl',
        'linkedinUrl',
        'sitioWebUrl',
        'consentimientoPublicacion',
      ];
      campos.forEach((c) => {
        if (req.body[c] !== undefined) estudiante[c] = req.body[c];
      });
      if (!propietario && esAdmin(req.usuario) && req.body.estadoPublicacion) {
        estudiante.estadoPublicacion = req.body.estadoPublicacion;
      }
    } else {
      let intentoCamposProhibidos = false;
      CAMPOS_PROPIETARIO.forEach((c) => {
        if (req.body[c] !== undefined) estudiante[c] = req.body[c];
      });
      ['nombre', 'apellidos', 'matricula', 'semestre', 'generacion', 'consentimientoPublicacion', 'estadoPublicacion'].forEach(
        (c) => {
          if (req.body[c] !== undefined) intentoCamposProhibidos = true;
        }
      );
      if (intentoCamposProhibidos) {
        return res.status(403).json({
          ok: false,
          mensaje: 'Solo la coordinación puede modificar datos académicos. Tus cambios de perfil se envían como propuesta.',
        });
      }
      estudiante.estadoPublicacion = 'pendiente';
    }

    await estudiante.save();
    res.json({
      ok: true,
      mensaje: propietario
        ? 'Propuesta enviada. Tu perfil se actualizará cuando sea aprobado.'
        : 'Estudiante actualizado correctamente.',
      dato: estudiante,
    });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/estudiantes/:id - solo administrador */
async function eliminar(req, res, next) {
  try {
    const estudiante = await Estudiante.findByIdAndDelete(req.params.id);
    if (!estudiante) return res.status(404).json({ ok: false, mensaje: 'Estudiante no encontrado.' });

    await Promise.all([
      Participacion.deleteMany({ estudiante: estudiante._id }),
      Logro.deleteMany({ estudiante: estudiante._id }),
      Proyecto.deleteMany({ estudiante: estudiante._id }),
      Certificacion.deleteMany({ estudiante: estudiante._id }),
      Evidencia.deleteMany({ estudiante: estudiante._id }),
    ]);

    res.json({ ok: true, mensaje: 'Estudiante y su trayectoria eliminados correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, CAMPOS_PROPIETARIO };
