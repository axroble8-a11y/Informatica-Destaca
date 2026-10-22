const { Router } = require('express');
const { body, param } = require('express-validator');

const certificacionController = require('../controllers/certificacionController');
const { proteger } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

const reglas = [
  body('estudiante').isMongoId().withMessage('Selecciona un estudiante válido'),
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 150 }),
  body('institucion').trim().notEmpty().withMessage('La institución es obligatoria').isLength({ max: 150 }),
  body('fechaObtencion').notEmpty().withMessage('La fecha de obtención es obligatoria').isISO8601().withMessage('Fecha inválida'),
  body('fechaExpiracion').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha inválida'),
  body('urlCredencial').optional({ values: 'falsy' }).isURL().withMessage('URL de credencial inválida'),
];

router.get('/', proteger, certificacionController.listar);

router.post('/', proteger, reglas, validarCampos, certificacionController.crear);

router.put(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  reglas,
  validarCampos,
  certificacionController.actualizar
);

router.delete(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  certificacionController.eliminar
);

module.exports = router;
