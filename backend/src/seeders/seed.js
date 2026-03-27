const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Apunta a backend/.env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS, MONGO_URI } = require('../config/env');
const User = require('../models/User');
const ComplaintType = require('../models/ComplaintType');
const ComplaintStatus = require('../models/ComplaintStatus');

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado');

    // --- SUPERADMIN ---
    const adminExiste = await User.findOne({ correo: 'admin@resireport.com' });
    if (!adminExiste) {
      const hash = await bcrypt.hash('Admin1234', BCRYPT_ROUNDS);
      await User.create({
        nombre: 'Administrador',
        correo: 'admin@resireport.com',
        password: hash,
        rol: 'superadmin',
        isActive: true,
      });
      console.log('Superadmin creado');
    } else {
      console.log('Superadmin ya existe, se omitió');
    }

    // --- RESIDENTE DE PRUEBA ---
    const residenteExiste = await User.findOne({ correo: 'residente@resireport.com' });
    if (!residenteExiste) {
      const hash = await bcrypt.hash('Resident1234', BCRYPT_ROUNDS);
      await User.create({
        nombre: 'Residente Prueba',
        correo: 'residente@resireport.com',
        password: hash,
        rol: 'resident',
        isActive: true,
        telefono: '3000000000',
        torre: 'A',
        apartamento: '101',
        tipoResidente: 'propietario',
      });
      console.log('Residente de prueba creado');
    } else {
      console.log('Residente de prueba ya existe, se omitió');
    }

    // --- TIPOS DE DENUNCIA ---
    const tipos = [
      { nombre: 'Ruido excesivo', descripcion: 'Molestias por ruido en horas no permitidas' },
      { nombre: 'Daño a zonas comunes', descripcion: 'Deterioro o daño en áreas compartidas' },
      { nombre: 'Mascota sin control', descripcion: 'Mascotas sueltas o sin supervisión' },
      { nombre: 'Basura mal dispuesta', descripcion: 'Residuos fuera de los puntos autorizados' },
      { nombre: 'Conflicto entre vecinos', descripcion: 'Disputas o situaciones de convivencia' },
      { nombre: 'Fuga de agua', descripcion: 'Pérdida o fuga de agua en zonas comunes o privadas' },
    ];
    for (const tipo of tipos) {
      const existe = await ComplaintType.findOne({ nombre: tipo.nombre });
      if (!existe) {
        await ComplaintType.create(tipo);
        console.log('Tipo creado:', tipo.nombre);
      } else {
        console.log('Tipo ya existe:', tipo.nombre);
      }
    }

    // --- ESTADOS BASE (RF-19) ---
    const estados = [
      { nombre: 'Registrada', color: 'FFA500', isDefault: true },
      { nombre: 'En proceso', color: '3B82F6', isDefault: true },
      { nombre: 'Resuelto', color: '22C55E', isDefault: true },
      { nombre: 'Rechazado', color: 'EF4444', isDefault: true },
    ];
    for (const estado of estados) {
      const existe = await ComplaintStatus.findOne({ nombre: estado.nombre });
      if (!existe) {
        await ComplaintStatus.create(estado);
        console.log('Estado creado:', estado.nombre);
      } else {
        await ComplaintStatus.updateOne({ _id: existe._id }, { color: estado.color });
        console.log('Estado actualizado con color:', estado.nombre);
      }
    }

    console.log('\nSeed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error.message);
    process.exit(1);
  }
};

seed();