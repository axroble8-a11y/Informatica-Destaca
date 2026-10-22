const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];
const TIPOS_PARTICIPACION = [
  'Asistente',
  'Expositor',
  'Concursante',
  'Organizador',
  'Colaborador',
  'Otro',
];

/**
 * Relación muchos a muchos entre Estudiante y Evento/Actividad.
 * Un estudiante puede participar en varios eventos y un evento
 * puede tener varios estudiantes.
 */
const participacionSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: [true, 'El estudiante es obligatorio'],
      index: true,
    },
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      default: null,
      index: true,
    },
    actividadLibre: {
      type: String,
      trim: true,
      maxlength: [150, 'La actividad no puede exceder 150 caracteres'],
      default: '',
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha de participación es obligatoria'],
    },
    tipo: {
      type: String,
      enum: { values: TIPOS_PARTICIPACION, message: 'Tipo de participación no válido: {VALUE}' },
      required: [true, 'El tipo de participación es obligatorio'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción de la actividad es obligatoria'],
      trim: true,
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    resultado: {
      type: String,
      trim: true,
      maxlength: [500, 'El resultado no puede exceder 500 caracteres'],
      default: '',
    },
    estadoPublicacion: {
      type: String,
      enum: { values: ESTADOS_PUBLICACION, message: 'Estado no válido: {VALUE}' },
      default: 'pendiente',
      index: true,
    },
    comentarioRevision: {
      type: String,
      trim: true,
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
      default: '',
    },
    propuestoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

participacionSchema.virtual('evidencias', {
  ref: 'Evidencia',
  localField: '_id',
  foreignField: 'participacion',
});

participacionSchema.index(
  { estudiante: 1, evento: 1, tipo: 1, fecha: 1 },
  { unique: false }
);

module.exports = mongoose.model('Participacion', participacionSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
module.exports.TIPOS_PARTICIPACION = TIPOS_PARTICIPACION;
