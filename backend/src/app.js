const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const adminRouter = require('./routes/adminRoutes');
const residentRoutes = require('./routes/residentRoutes');

const app = express();

// Orígenes permitidos según entorno
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean); // elimina undefined si FRONTEND_URL no está seteada

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sin origin (Postman, Render Shell, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado: origen no permitido → ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'ResiReport API corriendo' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/admins', adminRouter);
app.use('/api/residents', residentRoutes);

// 404
app.use((req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada' }));

// Error handler global — debe ir al final
app.use(errorHandler);

module.exports = app;