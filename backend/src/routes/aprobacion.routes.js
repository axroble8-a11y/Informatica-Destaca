const { Router } = require('express');
const { body, param } = require('express-validator');

const aprobacionController = require('../controllers/aprobacionController');
const { proteger, autorizar } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

router.use(proteger, autorizar('administrador'));

router.get('/', aprobacionController.listar);

router.patch(
  '/:tipo/:id',
  [
    param('tipo').isIn(Object.keys(aprobacionController.MODELOS)).withMessage('Tipo de contenido no válido'),
    param('id').isMongoId().withMessage('Identificador inválido'),
    body('accion').isIn(['aprobar', 'rechazar']).withMessage('Acción no válida'),
    body('comentario').optional({ values: 'falsy' }).isLength({ max: 500 }),
  ],
  validarCampos,
  aprobacionController.revisar
);

module.exports = router;
