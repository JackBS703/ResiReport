const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false, // Nunca se retorna en queries por defecto (RNF-03)
    },
    rol: {
      type: String,
      enum: ['superadmin', 'admin', 'resident'],
      required: [true, 'El rol es obligatorio'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    telefono: {
      type: String,
      trim: true,
      default: null,
    },
    // Solo aplica cuando rol === 'resident'
    torre: {
      type: String,
      trim: true,
      default: null,
    },
    apartamento: {
      type: String,
      trim: true,
      default: null,
    },
    tipoResidente: {
      type: String,
      enum: ['propietario', 'arrendatario', null],
      default: null,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('User', userSchema);