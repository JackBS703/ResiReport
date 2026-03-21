const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ComplaintType = require('../models/ComplaintType');
const ComplaintStatus = require('../models/ComplaintStatus');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');

    // --- ADMIN ---
    const adminExiste = await User.findOne({ correo: 'admin@resireport.com' });
    if (!adminExiste) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin1234', salt);
      await User.create({
        nombre: 'Administrador',
        correo: 'admin@resireport.com',
        password: passwordHash,
        rol: 'superadmin',
        isActive: true,
      });
      console.log('🌱 Admin creado');
    } else {
      console.log('⚠️  Admin ya existe, se omitió');
    }

    // --- TIPOS DE DENUNCIA ---
    const tipos = [
      { nombre: 'Ruido excesivo',      descripcion: 'Molestias por ruido en horas no permitidas' },
      { nombre: 'Daño a zonas comunes', descripcion: 'Deterioro o daño en áreas compartidas' },
      { nombre: 'Mascota sin control',  descripcion: 'Mascotas sueltas o sin supervisión' },
      { nombre: 'Basura mal dispuesta', descripcion: 'Residuos fuera de los puntos autorizados' },
      { nombre: 'Conflicto entre vecinos', descripcion: 'Disputas o situaciones de convivencia' },
    ];

    for (const tipo of tipos) {
      const existe = await ComplaintType.findOne({ nombre: tipo.nombre });
      if (!existe) {
        await ComplaintType.create(tipo);
        console.log(`🌱 Tipo creado: ${tipo.nombre}`);
      } else {
        console.log(`⚠️  Tipo ya existe: ${tipo.nombre}`);
      }
    }

    // --- ESTADOS BASE ---
    const estados = [
      { nombre: 'Registrada',    color: '#FFA500', isDefault: true },
      { nombre: 'En proceso',  color: '#3B82F6', isDefault: true },
      { nombre: 'Resuelto',     color: '#22C55E', isDefault: true },
      { nombre: 'Rechazado',    color: '#EF4444', isDefault: true },
    ];

    for (const estado of estados) {
      const existe = await ComplaintStatus.findOne({ nombre: estado.nombre });
      if (!existe) {
        await ComplaintStatus.create(estado);
        console.log(`🌱 Estado creado: ${estado.nombre}`);
      } else {
        console.log(`⚠️  Estado ya existe: ${estado.nombre}`);
      }
    }

    console.log('\n✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
};

seed();