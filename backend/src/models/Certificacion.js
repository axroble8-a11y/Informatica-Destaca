const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];

const certificacionSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: [true, 'El estudiante es obligatorio'],
      index: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la certificación es obligatorio'],
      trim: true,
      maxlength: [150, 'El nombre no puede exceder 150 caracteres'],
    },
    institucion: {
      type: String,
      required: [true, 'La institución emisora es obligatoria'],
      trim: true,
      maxlength: [150, 'La institución no puede exceder 150 caracteres'],
    },
    fechaObtencion: {
      type: Date,
      required: [true, 'La fecha de obtención es obligatoria'],
    },
    fechaExpiracion: {
      type: Date,
      default: null,
    },
    urlCredencial: {
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

module.exports = mongoose.model('Certificacion', certificacionSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
