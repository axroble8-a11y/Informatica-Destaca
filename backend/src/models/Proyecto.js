const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];

const proyectoSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: [true, 'El estudiante es obligatorio'],
      index: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del proyecto es obligatorio'],
      trim: true,
      maxlength: [150, 'El nombre no puede exceder 150 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
    },
    tecnologias: {
      type: [String],
      default: [],
    },
    fechaInicio: {
      type: Date,
    },
    fechaFin: {
      type: Date,
    },
    urlRepositorio: {
      type: String,
      trim: true,
      default: '',
    },
    urlDemo: {
      type: String,
      trim: true,
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
      maxlength: [500],
      default: '',
    },
    propuestoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proyecto', proyectoSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
