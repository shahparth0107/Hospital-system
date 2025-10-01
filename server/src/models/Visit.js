const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true },
    notes: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' }
  },
  { timestamps: true }
);

module.exports = { Visit: mongoose.model('Visit', VisitSchema) };
