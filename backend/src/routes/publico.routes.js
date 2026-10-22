const { Router } = require('express');
const buscadorController = require('../controllers/buscadorController');

const router = Router();

router.get('/busqueda', buscadorController.buscar);
router.get('/estadisticas', buscadorController.estadisticas);
router.get('/catalogos', buscadorController.catalogos);
router.get('/health', (req, res) => res.json({ ok: true, mensaje: 'API operativa', fecha: new Date() }));

module.exports = router;
