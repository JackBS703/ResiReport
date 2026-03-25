const mongoose = require('mongoose');

const complaintStatusSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del estado es obligatorio'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#9CA3AF',
    },
    isDefault: {
      type: Boolean,
      default: false, // true solo para los 4 estados mínimos del sistema (RF-19)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ComplaintStatus', complaintStatusSchema);