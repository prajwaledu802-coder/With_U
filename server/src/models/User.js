const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, enum: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'ur', 'or', 'as'], default: 'en' },
    gentleReachEnabled: { type: Boolean, default: false },
    voiceResponses: { type: Boolean, default: true },
    nudgeFrequency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    privacyMode: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    supabaseId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: '' },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ['caregiver', 'family', 'other'], default: 'caregiver' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    onboardingCompleted: { type: Boolean, default: false },
    settings: { type: settingsSchema, default: () => ({}) },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
