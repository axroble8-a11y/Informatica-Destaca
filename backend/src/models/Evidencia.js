const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];
const TIPOS_EVIDENCIA = ['Imagen', 'Video', 'Enlace'];

/**
 * Repositorio multimedia asociado a eventos, logros,
 * participaciones o estudiantes. Puede ser un archivo
 * subido al servidor, un enlace externo o un embed de video.
 */
const evidenciaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [150, 'El título no puede exceder 150 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
      default: '',
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    tipo: {
      type: String,
      enum: { values: TIPOS_EVIDENCIA, message: 'Tipo no válido: {VALUE}' },
      required: [true, 'El tipo de evidencia es obligatorio'],
    },
    archivoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    urlExterna: {
      type: String,
      trim: true,
      default: '',
    },
    evento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evento',
      default: null,
      index: true,
    },
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      default: null,
      index: true,
    },
    logro: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Logro',
      default: null,
      index: true,
    },
    participacion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participacion',
      default: null,
      index: true,
    },
    autorizadoPublicacion: {
      type: Boolean,
      default: false,
    },
    destacada: {
      type: Boolean,
      default: false,
    },
    estadoPublicacion: {
      type: String,
      enum: { values: ESTADOS_PUBLICACION, message: 'Estado no válido: {VALUE}' },
      default: 'pendiente',
      index: true,
    },
    subidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/** Devuelve la URL visualizable: archivo local, embed de video o enlace externo. */
evidenciaSchema.virtual('urlPublicacion').get(function () {
  if (this.archivoUrl) return this.archivoUrl;
  if (this.urlExterna) return this.urlExterna;
  return '';
});

evidenciaSchema.virtual('embedUrl').get(function () {
  const url = this.urlExterna || '';
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return '';
});

evidenciaSchema.index({ titulo: 'text' });

module.exports = mongoose.model('Evidencia', evidenciaSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
module.exports.TIPOS_EVIDENCIA = TIPOS_EVIDENCIA;
