const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const catalogRoutes = require('./routes/catalogRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ResiReport API corriendo ✅' });
});

// Aquí se registrarán las rutas de la API, por ejemplo:
// app.use('/api/auth', authRoutes);
// app.use('/api/residents', residentRoutes);
// ...
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/catalog', catalogRoutes);

// Middleware de manejo de errores (debe ir al final, después de las rutas)
app.use(errorHandler);

module.exports = app;