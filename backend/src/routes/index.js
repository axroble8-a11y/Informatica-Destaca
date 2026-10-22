const { Router } = require('express');

const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const estudianteRoutes = require('./estudiante.routes');
const eventoRoutes = require('./evento.routes');
const participacionRoutes = require('./participacion.routes');
const logroRoutes = require('./logro.routes');
const proyectoRoutes = require('./proyecto.routes');
const certificacionRoutes = require('./certificacion.routes');
const evidenciaRoutes = require('./evidencia.routes');
const aprobacionRoutes = require('./aprobacion.routes');
const publicoRoutes = require('./publico.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/estudiantes', estudianteRoutes);
router.use('/eventos', eventoRoutes);
router.use('/participaciones', participacionRoutes);
router.use('/logros', logroRoutes);
router.use('/proyectos', proyectoRoutes);
router.use('/certificaciones', certificacionRoutes);
router.use('/evidencias', evidenciaRoutes);
router.use('/aprobaciones', aprobacionRoutes);
router.use('/', publicoRoutes);

module.exports = router;
