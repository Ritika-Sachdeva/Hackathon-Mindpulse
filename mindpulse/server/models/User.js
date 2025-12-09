const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash this!
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  groupId: { type: String, required: true },
  avatar: { type: String }
});

// Frontend expects 'id', MongoDB provides '_id'. This converts it automatically.
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password; // Never send password back to client
  }
});

module.exports = mongoose.model('User', UserSchema);