const express = require('express');
const cors = require('cors');

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
app.use(errorHandler);

module.exports = app;