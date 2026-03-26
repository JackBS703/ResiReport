const fs = require('fs');
const https = require('https');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

const startServer = async () => {
  await connectDB(); // Primero conecta la BD, luego abre el puerto

  if (env.HTTPS === 'true') {
    const keyPath = env.HTTPS_KEY || './ssl/localhost-key.pem';
    const certPath = env.HTTPS_CERT || './ssl/localhost-cert.pem';

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error('❌ No se encuentran claves/certificados HTTPS en', keyPath, certPath);
      process.exit(1);
    }

    https.createServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }, app).listen(env.PORT, () => {
      console.log(`🚀 ResiReport API corriendo en https://localhost:${env.PORT}`);
    });
    return;
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 ResiReport API corriendo en http://localhost:${env.PORT}`);
  });
};

startServer();