const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/helpers');
const callService = require('../services/call.service');
const { triggerAICall, triggerContactCall } = require('../services/callService');
const retellService = require('../services/retellService');
const TrustedContact = require('../models/TrustedContact');

exports.sos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const userName = req.user?.name?.split(' ')[0] || 'a friend';
  const stressScore = Number(req.body?.stressScore || 0);
  const r = await callService.triggerSOS({
    userId,
    userName,
    stressScore,
    message: req.body?.message,
  });
  ok(res, r);
});

exports.helplines = asyncHandler(async (req, res) => {
  ok(res, { helplines: callService.listHelplines(req.query.region || 'IN') });
});

exports.startCall = asyncHandler(async (req, res) => {
  const r = await callService.startVideoCall({
    userId: req.user?._id || 'guest',
    peerId: req.body?.peerId,
  });
  ok(res, r);
});

/**
 * POST /call-ai
 * Triggers an AI support call to the user's phone.
 */
exports.callAI = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, 'Phone number is required');
  const userName = req.user?.name?.split(' ')[0] || 'friend';
  const result = await triggerAICall(phone, userName);
  res.json({ success: true, call: result });
});

/**
 * POST /call-contact
 * Triggers a call to a saved emergency contact.
 */
exports.callContact = asyncHandler(async (req, res) => {
  const { contactId, phone } = req.body;
  const userName = req.user?.name?.split(' ')[0] || 'A friend';

  let targetPhone = phone;

  // If contactId provided, look up the contact's phone
  if (contactId && !targetPhone) {
    const contact = await TrustedContact.findOne({ _id: contactId, user: req.user._id });
    if (!contact) throw new ApiError(404, 'Contact not found');
    targetPhone = contact.phone || contact.email;
  }

  if (!targetPhone) throw new ApiError(400, 'Phone number or contactId is required');

  const result = await triggerContactCall(targetPhone, userName);
  res.json({ success: true, call: result });
});

/**
 * POST /call-aira
 * Triggers a real AI phone call via Twilio to the user's phone.
 * The user's phone rings, and when they pick up, Aira speaks.
 */
exports.callAira = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, 'Phone number is required');

  // Clean phone — remove all non-digits, then let the service add +91 if needed
  const digits = phone.replace(/\D/g, '');
  // Remove leading 91 if user typed +91 or 91 before the 10-digit number
  const cleaned = digits.length > 10 && digits.startsWith('91') ? digits.slice(2) : digits;
  const toNumber = `+91${cleaned}`;
  const userName = req.user?.name?.split(' ')[0] || 'friend';

  // Use Twilio + Retell AI to make a conversational phone call
  const result = await triggerAICall(toNumber, userName);

  if (!result.ok) {
    throw new ApiError(502, result.error || 'Failed to initiate call');
  }

  res.json({
    success: true,
    call: result,
    message: `Calling ${toNumber}... Pick up your phone to talk to Aira!`,
  });
});
