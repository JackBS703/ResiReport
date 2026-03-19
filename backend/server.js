const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

const startServer = async () => {
  await connectDB(); // Primero conecta la BD, luego abre el puerto
  app.listen(env.PORT, () => {
    console.log(`🚀 ResiReport API corriendo en http://localhost:${env.PORT}`);
  });
};

startServer();