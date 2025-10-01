const mongoose = require('mongoose');

const LabReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    visitId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
    fileUrl:   { type: String, required: true }, // path to uploaded file
    title:     { type: String, required: true },
    uploadedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = { LabReport: mongoose.model('LabReport', LabReportSchema) };
