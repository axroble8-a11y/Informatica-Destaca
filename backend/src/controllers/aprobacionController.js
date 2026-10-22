const Estudiante = require('../models/Estudiante');
const Evento = require('../models/Evento');
const Participacion = require('../models/Participacion');
const Logro = require('../models/Logro');
const Proyecto = require('../models/Proyecto');
const Certificacion = require('../models/Certificacion');
const Evidencia = require('../models/Evidencia');

const MODELOS = {
  estudiantes: { modelo: Estudiante, etiqueta: 'Perfil de estudiante' },
  eventos: { modelo: Evento, etiqueta: 'Evento' },
  participaciones: { modelo: Participacion, etiqueta: 'Participación' },
  logros: { modelo: Logro, etiqueta: 'Logro' },
  proyectos: { modelo: Proyecto, etiqueta: 'Proyecto' },
  certificaciones: { modelo: Certificacion, etiqueta: 'Certificación' },
  evidencias: { modelo: Evidencia, etiqueta: 'Evidencia multimedia' },
};

/** GET /api/aprobaciones - admin: resumen y listado de contenido pendiente */
async function listar(req, res, next) {
  try {
    const resumen = {};
    for (const [clave, { modelo, etiqueta }] of Object.entries(MODELOS)) {
      resumen[clave] = { total: await modelo.countDocuments({ estadoPublicacion: 'pendiente' }), etiqueta };
    }

    let datos = [];
    const tipo = req.query.tipo;
    if (tipo && MODELOS[tipo]) {
      const { modelo } = MODELOS[tipo];
      let consulta = modelo.find({ estadoPublicacion: 'pendiente' }).sort({ createdAt: 1 }).limit(100);
      if (tipo === 'participaciones' || tipo === 'logros' || tipo === 'proyectos' || tipo === 'certificaciones') {
        consulta = consulta.populate('estudiante', 'nombre apellidos nombreCompleto');
      }
      if (tipo === 'participaciones') consulta = consulta.populate('evento', 'nombre');
      if (tipo === 'logros') consulta = consulta.populate('evento', 'nombre');
      if (tipo === 'evidencias') {
        consulta = consulta.populate('evento', 'nombre').populate('estudiante', 'nombre apellidos nombreCompleto');
      }
      if (tipo === 'estudiantes') {
        datos = (await consulta).map((d) => d.toJSON());
      } else {
        datos = await consulta;
      }
    }

    res.json({ ok: true, resumen, datos, etiqueta: tipo ? MODELOS[tipo].etiqueta : '' });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/aprobaciones/:tipo/:id - admin: aprobar o rechazar */
async function revisar(req, res, next) {
  try {
    const { tipo, id } = req.params;
    const { accion, comentario } = req.body;

    if (!MODELOS[tipo]) return res.status(400).json({ ok: false, mensaje: 'Tipo de contenido no válido.' });
    if (!['aprobar', 'rechazar'].includes(accion)) {
      return res.status(400).json({ ok: false, mensaje: 'Acción no válida: usa "aprobar" o "rechazar".' });
    }

    const { modelo, etiqueta } = MODELOS[tipo];
    const registro = await modelo.findById(id);
    if (!registro) return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado.' });

    registro.estadoPublicacion = accion === 'aprobar' ? 'aprobado' : 'rechazado';
    registro.comentarioRevision = comentario || '';
    await registro.save();

    const mensaje =
      accion === 'aprobar'
        ? `${etiqueta} aprobado y visible en el portal público.`
        : `${etiqueta} rechazado. No aparecerá en el portal público.`;

    res.json({ ok: true, mensaje, dato: registro });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, revisar, MODELOS };
