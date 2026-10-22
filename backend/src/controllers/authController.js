const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/env');
const Usuario = require('../models/Usuario');
const Estudiante = require('../models/Estudiante');

function generarToken(usuario) {
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email: String(email).toLowerCase() }).select('+password');

    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }
    if (!usuario.activo) {
      return res.status(403).json({ ok: false, mensaje: 'Tu cuenta está desactivada. Contacta al administrador.' });
    }

    res.json({
      ok: true,
      mensaje: `Bienvenido, ${usuario.nombre}.`,
      token: generarToken(usuario),
      usuario: usuario.aJSONPublico(),
    });
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/registro - crea una cuenta de estudiante con perfil asociado pendiente de aprobación. */
async function registro(req, res, next) {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos inválidos.',
        errores: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
      });
    }

    const { nombre, apellidos, matricula, semestre, generacion, email, password } = req.body;

    const existeEmail = await Usuario.findOne({ email: email.toLowerCase() });
    if (existeEmail) {
      return res.status(409).json({ ok: false, mensaje: 'Ya existe una cuenta con ese correo.' });
    }
    const existeMatricula = await Estudiante.findOne({ matricula: matricula.toUpperCase() });
    if (existeMatricula) {
      return res.status(409).json({ ok: false, mensaje: 'Ya existe un estudiante registrado con esa matrícula.' });
    }

    const estudiante = await Estudiante.create({
      nombre,
      apellidos,
      matricula: matricula.toUpperCase(),
      semestre,
      generacion: generacion || '',
      estadoPublicacion: 'pendiente',
      consentimientoPublicacion: false,
    });

    const usuario = await Usuario.create({
      nombre: `${nombre} ${apellidos}`.trim(),
      email,
      password,
      rol: 'estudiante',
      estudiante: estudiante._id,
    });

    await Estudiante.findByIdAndUpdate(estudiante._id, { usuario: usuario._id });

    res.status(201).json({
      ok: true,
      mensaje: 'Cuenta creada. Tu perfil estará visible al ser aprobado por la coordinación.',
      token: generarToken(usuario),
      usuario: usuario.aJSONPublico(),
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/auth/me */
async function perfilActual(req, res, next) {
  try {
    const usuario = await Usuario.findById(req.usuario._id).populate('estudiante');
    res.json({ ok: true, usuario: usuario.aJSONPublico(), perfilEstudiante: usuario.estudiante });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, registro, perfilActual, generarToken };
