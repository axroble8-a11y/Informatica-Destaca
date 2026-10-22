const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];
const CATEGORIAS_LOGRO = [
  'Académico',
  'Investigación',
  'Tecnología',
  'Innovación',
  'Deportivo',
  'Cultural',
  'Liderazgo',
  'Otro',
];
const TIPOS_RECONOCIMIENTO = [
  'Primer lugar',
  'Segundo lugar',
  'Tercer lugar',
  'Mención honorífica',
  'Premio especial',
  'Reconocimiento',
  'Beca',
  'Otro',
];

const logroSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: [true, 'El estudiante es obligatorio'],
      index: true,
    },
    titulo: {
      type: String,
      required: [true, 'El nombre del logro es obligatorio'],
      trim: true,
      maxlength: [150, 'El título no puede exceder 150 caracteres'],
    },
    categoria: {
      type: String,
      enum: { values: CATEGORIAS_LOGRO, message: 'Categoría no válida: {VALUE}' },
      required: [true, 'La categoría es obligatoria'],
      index: true,
    },
    tipoReconocimiento: {
      type: String,
      enum: { values: TIPOS_RECONOCIMIENTO, message: 'Tipo de reconocimiento no válido: {VALUE}' },
      default: 'Reconocimiento',
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha del logro es obligatoria'],
    },
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      default: null,
    },
    institucion: {
      type: String,
      trim: true,
      maxlength: [150, 'La institución no puede exceder 150 caracteres'],
      default: '',
    },
    destacado: {
      type: Boolean,
      default: false,
      index: true,
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

logroSchema.virtual('evidencias', {
  ref: 'Evidencia',
  localField: '_id',
  foreignField: 'logro',
});

logroSchema.index({ titulo: 'text', descripcion: 'text' });
logroSchema.index({ fecha: -1 });

module.exports = mongoose.model('Logro', logroSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
module.exports.CATEGORIAS_LOGRO = CATEGORIAS_LOGRO;
module.exports.TIPOS_RECONOCIMIENTO = TIPOS_RECONOCIMIENTO;
