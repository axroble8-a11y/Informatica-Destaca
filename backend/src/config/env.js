require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/informatica_destaca',
  enableMemoryDb: (process.env.ENABLE_MEMORY_DB || 'true') === 'true',
  jwt: {
    secret: process.env.JWT_SECRET || 'clave-desarrollo-informatica-destaca',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  uploads: {
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '5242880', 10),
    maxVideoSize: parseInt(process.env.MAX_VIDEO_SIZE || '52428800', 10),
  },
};

if (config.env === 'production' && config.jwt.secret.includes('desarrollo')) {
  console.warn('[config] ADVERTENCIA: JWT_SECRET por defecto en producción. Configura la variable JWT_SECRET.');
}

module.exports = config;
