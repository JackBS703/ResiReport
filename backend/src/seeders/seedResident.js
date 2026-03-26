const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedResident = async () => {
  try {
    await connectDB();

    const correo = 'residente@ejemplo.com';
    const existing = await User.findOne({ correo });

    if (existing) {
      console.log(`🔁 Residente ya existe: ${correo}`);
      process.exit(0);
    }

    const password = '123456'; // CAMBIAR EN PRODUCCIÓN
    const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS, 10) || 10);

    const resident = await User.create({
      nombre: 'Residente Demo',
      correo,
      password: hashed,
      rol: 'resident',
      isActive: true,
      torre: 'A',
      apartamento: '101',
      tipoResidente: 'propietario',
    });

    console.log('✅ Residente creado:', {
      id: resident._id.toString(),
      nombre: resident.nombre,
      correo: resident.correo,
      rol: resident.rol,
    });
    console.log('🔑 Contraseña:', password);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear residente:', error.message);
    process.exit(1);
  }
};

seedResident();
