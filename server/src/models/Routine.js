const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dailySchedule: [{
    time: { type: String, required: true },       // "08:00"
    task: { type: String, required: true },        // "Take Paracetamol (500 mg)"
    medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication' },
    type: { type: String, enum: ['medication', 'buffer', 'wellness'], default: 'medication' },
  }],
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
