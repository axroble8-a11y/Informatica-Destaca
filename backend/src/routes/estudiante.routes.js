const { Router } = require('express');
const { body, param } = require('express-validator');

const estudianteController = require('../controllers/estudianteController');
const { proteger, autorizar, usuarioOpcional } = require('../middlewares/auth');
const { validarCampos } = require('../middlewares/validate');

const router = Router();

const SEMESTRES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Egresado', 'Titulado'];

/** Público con filtros */
router.get('/', usuarioOpcional, estudianteController.listar);

router.get(
  '/:id',
  usuarioOpcional,
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  estudianteController.obtener
);

/** Protegidos */
router.post(
  '/',
  proteger,
  autorizar('administrador', 'responsable'),
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 80 }),
    body('apellidos').trim().notEmpty().withMessage('Los apellidos son obligatorios').isLength({ max: 80 }),
    body('matricula')
      .trim()
      .notEmpty()
      .withMessage('La matrícula es obligatoria')
      .matches(/^[A-Za-z0-9-]{4,20}$/)
      .withMessage('Matrícula alfanumérica de 4 a 20 caracteres'),
    body('semestre').isIn(SEMESTRES).withMessage('Semestre no válido'),
    body('correoContacto').optional({ values: 'falsy' }).isEmail().withMessage('Correo de contacto inválido'),
  ],
  validarCampos,
  estudianteController.crear
);

router.put(
  '/:id',
  proteger,
  autorizar('administrador', 'responsable', 'estudiante'),
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  estudianteController.actualizar
);

router.delete(
  '/:id',
  proteger,
  autorizar('administrador'),
  param('id').isMongoId().withMessage('Identificador inválido'),
  validarCampos,
  estudianteController.eliminar
);

module.exports = router;
