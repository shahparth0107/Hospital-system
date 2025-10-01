const mongoose = require('mongoose');

const ROLES = ['ADMIN', 'RECEPTION', 'DOCTOR', 'LAB'];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true }
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model('User', UserSchema),
  ROLES
};
