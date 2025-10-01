const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    visitId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    items: [
      {
        desc: { type: String, required: true },
        amount: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ['UNPAID','PAID'], default: 'UNPAID' },
    pdfUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = { Bill: mongoose.model('Bill', BillSchema) };
