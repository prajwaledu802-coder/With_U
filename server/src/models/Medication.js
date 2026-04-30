const mongoose = require('mongoose');

/**
 * Smart Medication entry.
 *
 * Per product spec: the contact mobile number is captured here when the
 * user adds a medication. That number is then re-used elsewhere
 * (GentleReach fallback, profile contact info) instead of asking a
 * second time.
 */
const medicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    name: { type: String, required: true, trim: true },
    dosage: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },

    // Smart Medication tracking
    duration: { type: String, default: '', trim: true },  // e.g. "5 days", "2 weeks"
    effects: {
      type: String,
      enum: ['good', 'side_effects', 'no_change', ''],
      default: '',
    },
    effectNotes: { type: String, default: '', trim: true },
    timing: {
      type: String,
      enum: ['morning', 'afternoon', 'night', 'custom', ''],
      default: '',
    },

    // Reminder schedule (24-h "HH:MM")
    times: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((t) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(t)),
        message: 'Times must be HH:MM (24-hour).',
      },
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'twice', 'thrice', 'as_needed', 'custom'],
      default: 'daily',
    },

    // The phone the user enters when creating this medication.
    // Treated as the canonical reminder/SMS number for this user.
    mobileNumber: { type: String, required: true, trim: true },
    countryCode: { type: String, default: '+91', trim: true },
    reminderEmail: { type: String, default: '', trim: true, lowercase: true },

    // Notification channel toggles
    enableWhatsApp: { type: Boolean, default: true },
    enableEmail: { type: Boolean, default: true },
    enableSMS: { type: Boolean, default: true },

    // Email verification flow — reminders only fire once verified
    verified: { type: Boolean, default: false },
    confirmationToken: { type: String, default: '' },
    emailVerifiedAt: { type: Date, default: null },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true },

    color: { type: String, default: '#a78bfa' },
    icon: { type: String, default: '💊' },

    lastTakenAt: { type: Date, default: null },
    lastReminderAt: { type: Date, default: null },
    streak: { type: Number, default: 0 },

    // Adherence tracking: log each day's taken/missed status
    adherenceLog: [{
      date: { type: Date },
      taken: { type: Boolean, default: false },
      takenAt: { type: Date },
    }],

    // Track which time slots have been reminded today (prevents duplicate notifications)
    // Format: "YYYY-MM-DD|HH:MM"
    remindedSlots: { type: [String], default: [] },
  },
  { timestamps: true }
);

medicationSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
