const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const connectDB = require('./config/db');
const sembrar = require('./seed/seed');
const Usuario = require('./models/Usuario');
const { noEncontrado, errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

async function main() {
  const { mode } = await connectDB();

  if (mode === 'memory' || (await Usuario.countDocuments({})) === 0) {
    console.log('[seed] Base de datos vacía: cargando datos de prueba...');
    await sembrar({});
  }

  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (config.env !== 'test') {
    app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  }

  // Límite de peticiones para rutas de autenticación (fuerza bruta)
  const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, mensaje: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' },
  });
  app.use('/api/auth', limiterAuth);

  // Archivos multimedia subidos
  app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', 'uploads'), {
      maxAge: '7d',
      fallthrough: true,
    })
  );

  // Frontend estático (SPA). El backend sirve la interfaz en el mismo origen.
  const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
  app.use(express.static(FRONTEND_DIR));

  // API
  app.use('/api', routes);

  // SPA fallback: cualquier ruta no-API devuelve el index.html
  app.get(/^\/(?!api|uploads).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });

  app.use(noEncontrado);
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log('========================================================');
    console.log('  INFORMÁTICA DESTACA - Servidor iniciado');
    console.log(`  Entorno : ${config.env}`);
    console.log(`  URL     : http://localhost:${config.port}`);
    console.log(`  API     : http://localhost:${config.port}/api`);
    console.log('========================================================');
  });

  const apagar = (senal) => {
    console.log(`\n[server] Recibida señal ${senal}. Cerrando servidor...`);
    const { default: mongoose } = require('mongoose');
    mongoose.connection.close().then(() => process.exit(0));
  };
  process.on('SIGINT', () => apagar('SIGINT'));
  process.on('SIGTERM', () => apagar('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] Error fatal al iniciar:', err.message);
  process.exit(1);
});
