const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Medication = require('../models/Medication');
const { sendReminderSMS, buildReminderMessage } = require('../services/medicationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/sms/send-reminder
 * Body: { medicationId }
 * Sends an SMS reminder for a specific medication.
 */
router.post(
  '/send-reminder',
  protect,
  asyncHandler(async (req, res) => {
    const { medicationId } = req.body;
    if (!medicationId) throw new ApiError(400, 'medicationId is required');

    const med = await Medication.findOne({ _id: medicationId, user: req.user._id });
    if (!med) throw new ApiError(404, 'Medication not found');

    const phone = `${med.countryCode || '+91'}${med.mobileNumber}`.replace(/\s+/g, '');
    const message = buildReminderMessage(med);
    const result = await sendReminderSMS(phone, message);

    med.lastReminderAt = new Date();
    await med.save();

    res.json({ success: true, sms: result, message });
  })
);

module.exports = router;
