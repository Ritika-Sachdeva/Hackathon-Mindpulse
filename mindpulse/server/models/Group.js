const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  announcement: { type: String, default: '' },
  vibes: { type: Number, default: 0 },
  vibeHistory: [{
    userId: String,
    date: String // Format YYYY-MM-DD
  }]
});

GroupSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.vibeHistory; // Don't send the full history to client, it's internal
  }
});

module.exports = mongoose.model('Group', GroupSchema);