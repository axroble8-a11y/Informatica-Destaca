const { Router } = require('express');
const { body, param } = require('express-validator');

const usuarioController = require('../controllers/usuarioController');
const { proteger, autorizar } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

router.use(proteger, autorizar('administrador'));

router.get('/', usuarioController.listar);

router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').trim().isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('rol').isIn(['administrador', 'responsable', 'estudiante']).withMessage('Rol no válido'),
  ],
  validarCampos,
  usuarioController.crear
);

router.put('/:id', param('id').isMongoId().withMessage('Identificador inválido'), validarCampos, usuarioController.actualizar);

router.delete('/:id', param('id').isMongoId().withMessage('Identificador inválido'), validarCampos, usuarioController.eliminar);

module.exports = router;
