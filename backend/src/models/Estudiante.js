const mongoose = require('mongoose');

const ESTADOS_PUBLICACION = ['pendiente', 'aprobado', 'rechazado'];

const estudianteSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [80, 'El nombre no puede exceder 80 caracteres'],
    },
    apellidos: {
      type: String,
      required: [true, 'Los apellidos son obligatorios'],
      trim: true,
      maxlength: [80, 'Los apellidos no pueden exceder 80 caracteres'],
    },
    matricula: {
      type: String,
      required: [true, 'La matrícula es obligatoria'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]{4,20}$/, 'La matrícula debe tener entre 4 y 20 caracteres alfanuméricos'],
    },
    semestre: {
      type: String,
      required: [true, 'El semestre es obligatorio'],
      enum: {
        values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Egresado', 'Titulado'],
        message: 'Semestre no válido: {VALUE}',
      },
    },
    generacion: {
      type: String,
      trim: true,
      maxlength: [20, 'La generación no puede exceder 20 caracteres'],
    },
    fotoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    perfilProfesional: {
      type: String,
      trim: true,
      maxlength: [1200, 'La presentación profesional no puede exceder 1200 caracteres'],
      default: '',
    },
    areasInteres: {
      type: [String],
      default: [],
    },
    habilidades: [
      {
        nombre: { type: String, required: true, trim: true, maxlength: 60 },
        nivel: {
          type: String,
          enum: ['Básico', 'Intermedio', 'Avanzado'],
          default: 'Básico',
        },
      },
    ],
    correoContacto: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo de contacto inválido'],
    },
    githubUrl: { type: String, trim: true, default: '' },
    linkedinUrl: { type: String, trim: true, default: '' },
    sitioWebUrl: { type: String, trim: true, default: '' },
    consentimientoPublicacion: {
      type: Boolean,
      default: false,
    },
    estadoPublicacion: {
      type: String,
      enum: { values: ESTADOS_PUBLICACION, message: 'Estado no válido: {VALUE}' },
      default: 'aprobado',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

estudianteSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellidos}`.trim();
});

estudianteSchema.virtual('logros', {
  ref: 'Logro',
  localField: '_id',
  foreignField: 'estudiante',
});

estudianteSchema.index({ nombre: 'text', apellidos: 'text' });

module.exports = mongoose.model('Estudiante', estudianteSchema);
module.exports.ESTADOS_PUBLICACION = ESTADOS_PUBLICACION;
