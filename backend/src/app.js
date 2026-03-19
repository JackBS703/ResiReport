const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check — verifica que el servidor responde antes de conectar la BD
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ResiReport API corriendo ✅' });
});

module.exports = app;