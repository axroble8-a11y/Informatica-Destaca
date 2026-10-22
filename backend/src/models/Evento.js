const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];
const ESTADOS_EVENTO = ['proximo', 'realizado', 'cancelado'];
const CATEGORIAS_EVENTO = [
  'Académico',
  'Tecnológico',
  'Concurso',
  'Congreso',
  'Feria',
  'Taller',
  'Cultural',
  'Deportivo',
  'Otro',
];

const eventoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del evento es obligatorio'],
      trim: true,
      maxlength: [150, 'El nombre no puede exceder 150 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [3000, 'La descripción no puede exceder 3000 caracteres'],
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    fechaFin: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.fechaInicio || v >= this.fechaInicio;
        },
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
      },
    },
    horario: {
      type: String,
      trim: true,
      maxlength: [100, 'El horario no puede exceder 100 caracteres'],
      default: '',
    },
    modalidad: {
      type: String,
      enum: { values: ['Presencial', 'Virtual', 'Híbrida'], message: 'Modalidad no válida: {VALUE}' },
      default: 'Presencial',
    },
    lugar: {
      type: String,
      trim: true,
      maxlength: [200, 'El lugar no puede exceder 200 caracteres'],
      default: '',
    },
    organizador: {
      type: String,
      required: [true, 'El organizador es obligatorio'],
      trim: true,
      maxlength: [150, 'El organizador no puede exceder 150 caracteres'],
    },
    categoria: {
      type: String,
      enum: { values: CATEGORIAS_EVENTO, message: 'Categoría no válida: {VALUE}' },
      default: 'Académico',
      index: true,
    },
    imagenUrl: {
      type: String,
      trim: true,
      default: '',
    },
    estado: {
      type: String,
      enum: { values: ESTADOS_EVENTO, message: 'Estado no válido: {VALUE}' },
      default: 'proximo',
      index: true,
    },
    estadoPublicacion: {
      type: String,
      enum: { values: ESTADOS_PUBLICACION, message: 'Estado de publicación no válido: {VALUE}' },
      default: 'pendiente',
      index: true,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

eventoSchema.virtual('participaciones', {
  ref: 'Participacion',
  localField: '_id',
  foreignField: 'evento',
});

eventoSchema.index({ nombre: 'text', descripcion: 'text' });
eventoSchema.index({ fechaInicio: 1 });

module.exports = mongoose.model('Evento', eventoSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
module.exports.ESTADOS_EVENTO = ESTADOS_EVENTO;
module.exports.CATEGORIAS_EVENTO = CATEGORIAS_EVENTO;
