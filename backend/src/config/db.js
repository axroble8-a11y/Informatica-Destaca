const mongoose = require('mongoose');
const config = require('./env');

/**
 * Conexión a MongoDB.
 * Si no hay servidor MongoDB disponible y ENABLE_MEMORY_DB=true,
 * se levanta una instancia en memoria (mongodb-memory-server) para
 * poder ejecutar la aplicación en modo demostración sin instalación.
 */
async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[db] MongoDB conectado: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return { mode: 'mongodb' };
  } catch (error) {
    console.error(`[db] No se pudo conectar a MongoDB (${error.message})`);

    if (!config.enableMemoryDb) {
      throw error;
    }

    console.log('[db] Intentando modo demostración con base de datos EN MEMORIA (los datos se pierden al detener el servidor)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    const uri = mem.getUri('informatica_destaca');
    await mongoose.connect(uri);
    console.log(`[db] MongoDB EN MEMORIA listo en ${uri}`);
    console.log('[db] MODO DEMO: ejecuta "npm run seed" para cargar datos de prueba.');
    return { mode: 'memory', memoryServer: mem };
  }
}

module.exports = connectDB;
