const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Medication = require('../models/Medication');
const { sendWhatsApp, sendMedicationReminder, isEnabled } = require('../services/whatsappService');

// POST /api/notify/test — send a test WhatsApp message
exports.test = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, 'Phone number is required');
  const result = await sendWhatsApp(phone, '✅ WITH_U Test: WhatsApp notifications are working!');
  res.json({ success: true, whatsappEnabled: isEnabled(), result });
});

// POST /api/notify/send — send a medication reminder
exports.send = asyncHandler(async (req, res) => {
  const { medicationId, phone } = req.body;

  if (medicationId) {
    const med = await Medication.findOne({ _id: medicationId, user: req.user._id });
    if (!med) throw new ApiError(404, 'Medication not found');
    const result = await sendMedicationReminder(
      phone || med.mobileNumber,
      med.name,
      med.dosage
    );
    return res.json({ success: true, result });
  }

  if (phone) {
    const meds = await Medication.find({ user: req.user._id, active: true }).lean();
    const results = [];
    for (const med of meds) {
      const r = await sendMedicationReminder(phone, med.name, med.dosage);
      results.push({ name: med.name, ...r });
    }
    return res.json({ success: true, results });
  }

  throw new ApiError(400, 'Provide medicationId or phone');
});

// GET /api/notify/status
exports.status = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    whatsappEnabled: isEnabled(),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  });
});
