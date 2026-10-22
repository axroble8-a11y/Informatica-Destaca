const { Router } = require('express');
const { body, param } = require('express-validator');

const logroController = require('../controllers/logroController');
const Logro = require('../models/Logro');
const { proteger, autorizar, usuarioOpcional } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

const reglas = [
  body('estudiante').isMongoId().withMessage('Selecciona un estudiante válido'),
  body('titulo').trim().notEmpty().withMessage('El nombre del logro es obligatorio').isLength({ max: 150 }),
  body('categoria').isIn(Logro.schema.path('categoria').enumValues).withMessage('Categoría no válida'),
  body('tipoReconocimiento').optional().isIn(Logro.schema.path('tipoReconocimiento').enumValues).withMessage('Tipo no válido'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria').isLength({ max: 2000 }),
  body('fecha').notEmpty().withMessage('La fecha es obligatoria').isISO8601().withMessage('Fecha inválida'),
  body('evento').optional({ values: 'falsy' }).isMongoId().withMessage('Evento inválido'),
  body('institucion').optional({ values: 'falsy' }).isLength({ max: 150 }),
];

router.get('/', usuarioOpcional, logroController.listar);

router.get('/:id', usuarioOpcional, param('id').isMongoId().withMessage('Identificador inválido'), validarCampos, logroController.obtener);

router.post('/', proteger, reglas, validarCampos, logroController.crear);

router.put(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  reglas,
  validarCampos,
  logroController.actualizar
);

router.delete(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  logroController.eliminar
);

module.exports = router;
