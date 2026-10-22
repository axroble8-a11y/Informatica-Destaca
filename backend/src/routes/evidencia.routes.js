const { Router } = require('express');
const { body, param } = require('express-validator');

const evidenciaController = require('../controllers/evidenciaController');
const Evidencia = require('../models/Evidencia');
const { proteger, autorizar, usuarioOpcional } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');
const { subirArchivo } = require('../middlewares/upload');

const router = Router();

const reglas = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio').isLength({ max: 150 }),
  body('descripcion').optional({ values: 'falsy' }).isLength({ max: 1000 }),
  body('fecha').notEmpty().withMessage('La fecha es obligatoria').isISO8601().withMessage('Fecha inválida'),
  body('tipo')
    .optional()
    .isIn(Evidencia.schema.path('tipo').enumValues)
    .withMessage('Tipo de evidencia no válido'),
  body('urlExterna').optional({ values: 'falsy' }).isURL().withMessage('URL externa inválida'),
  body('evento').optional({ values: 'falsy' }).isMongoId().withMessage('Evento inválido'),
  body('estudiante').optional({ values: 'falsy' }).isMongoId().withMessage('Estudiante inválido'),
  body('logro').optional({ values: 'falsy' }).isMongoId().withMessage('Logro inválido'),
  body('participacion').optional({ values: 'falsy' }).isMongoId().withMessage('Participación inválida'),
];

router.get('/', usuarioOpcional, evidenciaController.listar);

router.post(
  '/',
  proteger,
  subirArchivo.single('archivo'),
  reglas,
  validarCampos,
  evidenciaController.crear
);

router.put(
  '/:id',
  proteger,
  subirArchivo.single('archivo'),
  param('id').isMongoId().withMessage('Identificador inválido'),
  reglas,
  validarCampos,
  evidenciaController.actualizar
);

router.patch(
  '/:id/destacada',
  proteger,
  autorizar('administrador'),
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  evidenciaController.destacar
);

router.delete(
  '/:id',
  proteger,
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  evidenciaController.eliminar
);

module.exports = router;
