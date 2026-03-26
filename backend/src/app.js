const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const adminRouter = require('./routes/adminRoutes');
const residentRoutes = require('./routes/residentRoutes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ResiReport API corriendo ✅' });
});

// Aquí se registrarán las rutas de la API, por ejemplo:
// app.use('/api/auth', authRoutes);
// app.use('/api/residents', residentRoutes);
// ...
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/admins', adminRouter);
app.use('/api/residents', residentRoutes); 

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada',
  });
});

// Middleware de manejo de errores (debe ir al final, después de las rutas)
app.use(errorHandler);

module.exports = app;