const { Router } = require('express');
const { body, param } = require('express-validator');

const proyectoController = require('../controllers/proyectoController');
const { proteger } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

const reglas = [
  body('estudiante').isMongoId().withMessage('Selecciona un estudiante válido'),
  body('nombre').trim().notEmpty().withMessage('El nombre del proyecto es obligatorio').isLength({ max: 150 }),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria').isLength({ max: 2000 }),
  body('fechaInicio').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha inválida'),
  body('fechaFin').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha inválida'),
  body('urlRepositorio').optional({ values: 'falsy' }).isURL().withMessage('URL de repositorio inválida'),
  body('urlDemo').optional({ values: 'falsy' }).isURL().withMessage('URL de demo inválida'),
];

router.get('/', proteger, proyectoController.listar);

router.post('/', proteger, reglas, validarCampos, proyectoController.crear);

router.put(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  reglas,
  validarCampos,
  proyectoController.actualizar
);

router.delete(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  proyectoController.eliminar
);

module.exports = router;
