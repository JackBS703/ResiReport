require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validación al arranque — falla rápido si faltan variables críticas
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
REQUIRED.forEach((key) => {
  if (!env[key]) {
    console.error(`❌ Variable de entorno requerida no definida: ${key}`);
    process.exit(1); // Detiene el servidor inmediatamente
  }
});

module.exports = env;