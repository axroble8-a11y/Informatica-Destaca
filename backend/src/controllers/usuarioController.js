const Usuario = require('../models/Usuario');
const { esAdmin } = require('../utils/helpers');

/** GET /api/usuarios - solo administrador */
async function listar(req, res, next) {
  try {
    const filtro = {};
    if (req.query.rol && ['administrador', 'responsable', 'estudiante'].includes(req.query.rol)) {
      filtro.rol = req.query.rol;
    }
    if (req.query.q) {
      const rx = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filtro.$or = [{ nombre: rx }, { email: rx }];
    }

    const usuarios = await Usuario.find(filtro)
      .populate('estudiante', 'nombre apellidos matricula semestre')
      .sort({ createdAt: -1 });

    res.json({ ok: true, total: usuarios.length, datos: usuarios.map((u) => u.aJSONPublico()) });
  } catch (error) {
    next(error);
  }
}

/** POST /api/usuarios - solo administrador */
async function crear(req, res, next) {
  try {
    const { nombre, email, password, rol, estudiante } = req.body;
    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ ok: false, mensaje: 'Ya existe un usuario con ese correo.' });
    }
    const usuario = await Usuario.create({ nombre, email, password, rol, estudiante: estudiante || null });
    res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente.', dato: usuario.aJSONPublico() });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/usuarios/:id - solo administrador */
async function actualizar(req, res, next) {
  try {
    const { nombre, email, rol, estudiante, activo, password } = req.body;
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });

    if (esAdmin(usuario) && usuario._id.equals(req.usuario._id) && (rol === false || rol === 'responsable' || rol === 'estudiante' || activo === false)) {
      return res.status(400).json({ ok: false, mensaje: 'No puedes quitarte a ti mismo los permisos de administrador ni desactivar tu propia cuenta.' });
    }

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email.toLowerCase();
    if (rol) usuario.rol = rol;
    if (estudiante !== undefined) usuario.estudiante = estudiante || null;
    if (activo !== undefined) usuario.activo = !!activo;
    if (password) {
      if (String(password).length < 8) {
        return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
      }
      usuario.password = password;
    }

    await usuario.save();
    res.json({ ok: true, mensaje: 'Usuario actualizado correctamente.', dato: usuario.aJSONPublico() });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/usuarios/:id - solo administrador */
async function eliminar(req, res, next) {
  try {
    if (String(req.params.id) === String(req.usuario._id)) {
      return res.status(400).json({ ok: false, mensaje: 'No puedes eliminar tu propia cuenta.' });
    }
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    res.json({ ok: true, mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, eliminar };
