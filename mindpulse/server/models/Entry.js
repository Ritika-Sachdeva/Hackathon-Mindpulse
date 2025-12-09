const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  mood: { type: String, required: true },
  stressLevel: { type: Number, required: true },
  energyLevel: { type: Number, required: true },
  sleepQuality: { type: Number, required: true },
  note: { type: String },
  sentimentScore: { type: Number },
  burnoutRisk: { type: Boolean, default: false },
  aiIntervention: { type: String },
  tags: [{ type: String }]
});

EntrySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Entry', EntrySchema);