const { Router } = require('express');
const { body, param } = require('express-validator');

const eventoController = require('../controllers/eventoController');
const Evento = require('../models/Evento');
const { proteger, autorizar, usuarioOpcional } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

const reglasDatos = [
  body('nombre').trim().notEmpty().withMessage('El nombre del evento es obligatorio').isLength({ max: 150 }),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria').isLength({ max: 3000 }),
  body('fechaInicio').notEmpty().withMessage('La fecha de inicio es obligatoria').isISO8601().withMessage('Fecha inválida'),
  body('fechaFin').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha inválida'),
  body('modalidad').optional().isIn(Evento.schema.path('modalidad').enumValues).withMessage('Modalidad no válida'),
  body('categoria').optional().isIn(Evento.schema.path('categoria').enumValues).withMessage('Categoría no válida'),
  body('estado').optional().isIn(Evento.schema.path('estado').enumValues).withMessage('Estado no válido'),
  body('organizador').trim().notEmpty().withMessage('El organizador es obligatorio').isLength({ max: 150 }),
  body('lugar').optional({ values: 'falsy' }).isLength({ max: 200 }),
  body('horario').optional({ values: 'falsy' }).isLength({ max: 100 }),
  body('imagenUrl').optional({ values: 'falsy' }).isLength({ max: 500 }),
];

router.get('/', usuarioOpcional, eventoController.listar);

router.get('/:id', usuarioOpcional, param('id').isMongoId().withMessage('Identificador inválido'), validarCampos, eventoController.obtener);

router.post('/', proteger, autorizar('administrador', 'responsable'), reglasDatos, validarCampos, eventoController.crear);

router.put(
  '/:id',
  proteger,
  autorizar('administrador', 'responsable'),
  param('id').isMongoId().withMessage('Identificador inválido'),
  reglasDatos,
  validarCampos,
  eventoController.actualizar
);

router.patch(
  '/:id/estado',
  proteger,
  autorizar('administrador', 'responsable'),
  [
    param('id').isMongoId().withMessage('Identificador inválido'),
    body('estado').isIn(Evento.schema.path('estado').enumValues).withMessage('Estado no válido'),
  ],
  validarCampos,
  eventoController.cambiarEstado
);

router.delete(
  '/:id',
  proteger,
  autorizar('administrador'),
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  eventoController.eliminar
);

module.exports = router;
