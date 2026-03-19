const mongoose = require('mongoose');

// Subdocumento — no es una colección independiente, vive dentro de cada complaint
const statusHistorySchema = new mongoose.Schema(
  {
    estadoAnterior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplaintStatus',
      default: null, // null en la entrada inicial al crear la denuncia
    },
    estadoNuevo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplaintStatus',
      required: true,
    },
    cambiadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, // No necesita ID propio, es parte del documento padre
  }
);

const complaintSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    ubicacion: {
      type: String,
      required: [true, 'La ubicación es obligatoria'],
      trim: true,
    },
    tipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplaintType',
      required: [true, 'El tipo de denuncia es obligatorio'],
    },
    estado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplaintStatus',
      required: true,
    },
    residente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prioridad: {
      type: String,
      enum: ['sin_asignar', 'baja', 'media', 'alta'],
      default: 'sin_asignar', // RF-23 — admin asigna, residente no puede cambiarla
    },
    statusHistory: [statusHistorySchema], // RF-31 — historial de cambios de estado
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);