const { Router } = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const { proteger } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('El correo es obligatorio').isEmail().withMessage('Correo electrónico inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  validarCampos,
  authController.login
);

router.post(
  '/registro',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 80 }).withMessage('Máximo 80 caracteres'),
    body('apellidos').trim().notEmpty().withMessage('Los apellidos son obligatorios').isLength({ max: 80 }).withMessage('Máximo 80 caracteres'),
    body('matricula')
      .trim()
      .notEmpty()
      .withMessage('La matrícula es obligatoria')
      .matches(/^[A-Za-z0-9-]{4,20}$/)
      .withMessage('La matrícula debe tener entre 4 y 20 caracteres alfanuméricos'),
    body('semestre').notEmpty().withMessage('El semestre es obligatorio'),
    body('email').trim().isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/[A-Za-z]/)
      .withMessage('La contraseña debe incluir al menos una letra')
      .matches(/[0-9]/)
      .withMessage('La contraseña debe incluir al menos un número'),
  ],
  validarCampos,
  authController.registro
);

router.get('/me', proteger, authController.perfilActual);

module.exports = router;
