const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config(); // busca .env en backend/ automáticamente

const MONGO_URI = process.env.MONGO_URI;

const adminData = {
  nombre: 'Administrador',
  correo: 'admin@resireport.com',
  password: 'Admin1234',
  rol: 'admin',
  isActive: true,
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB conectado');

    const existe = await User.findOne({ correo: adminData.correo });
    if (existe) {
      console.log('⚠️  El admin ya existe, no se creó duplicado');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminData.password, salt);

    await User.create({ ...adminData, password: passwordHash });

    console.log('🌱 Admin creado exitosamente');
    console.log(`   Correo: ${adminData.correo}`);
    console.log(`   Password: ${adminData.password}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
};

seed();