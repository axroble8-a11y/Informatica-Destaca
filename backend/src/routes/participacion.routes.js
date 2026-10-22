const { Router } = require('express');
const { body, param } = require('express-validator');

const participacionController = require('../controllers/participacionController');
const Participacion = require('../models/Participacion');
const { proteger, autorizar } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

const reglas = [
  body('estudiante').isMongoId().withMessage('Selecciona un estudiante válido'),
  body('evento').optional({ values: 'falsy' }).isMongoId().withMessage('Evento inválido'),
  body('actividadLibre').optional({ values: 'falsy' }).isLength({ max: 150 }),
  body('fecha').notEmpty().withMessage('La fecha es obligatoria').isISO8601().withMessage('Fecha inválida'),
  body('tipo').isIn(Participacion.schema.path('tipo').enumValues).withMessage('Tipo de participación no válido'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria').isLength({ max: 2000 }),
  body('resultado').optional({ values: 'falsy' }).isLength({ max: 500 }),
];

router.get('/', proteger, participacionController.listar);

router.post('/', proteger, reglas, validarCampos, participacionController.crear);

router.put(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  reglas,
  validarCampos,
  participacionController.actualizar
);

router.delete(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  participacionController.eliminar
);

module.exports = router;
