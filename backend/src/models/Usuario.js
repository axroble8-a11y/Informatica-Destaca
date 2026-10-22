const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROL_USUARIO = ['administrador', 'responsable', 'estudiante'];

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [80, 'El nombre no puede exceder 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo electrónico inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false,
    },
    rol: {
      type: String,
      enum: { values: ROL_USUARIO, message: 'Rol no válido: {VALUE}' },
      default: 'estudiante',
      index: true,
    },
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      default: null,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

usuarioSchema.methods.compararPassword = function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

usuarioSchema.methods.aJSONPublico = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    estudiante: this.estudiante,
    activo: this.activo,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Usuario', usuarioSchema);
module.exports.ROLES = ROL_USUARIO;
