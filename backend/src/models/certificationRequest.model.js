const mongoose = require('mongoose');

const CertificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificationType: {
    type: String,
    enum: ['CALIDAD_SOFTWARE', 'ISO_27001', 'SEGURIDAD_APP'],
    required: true
  },
  status: {
    type: String,
    enum: ['En proceso', 'Completada', 'Rechazada'],
    default: 'En proceso'
  },
  projectName: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  },
  projectUrl: {
    type: String,
    required: true
  },
  repoUrl: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
  },
  companyAddress: {
    type: String,
  },
  appPlatform: {
    type: String,
    enum: ['Web', 'Mobile', 'Desktop']
  },
  cost: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Índices para acelerar búsquedas por nombre, tipo y fechas
CertificationRequestSchema.index({ projectName: 'text' });
CertificationRequestSchema.index({ certificationType: 1, createdAt: -1 });
CertificationRequestSchema.index({ createdAt: -1 });

const CertificationRequest = mongoose.model('CertificationRequest', CertificationRequestSchema);

module.exports = CertificationRequest;