const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Medication = require('../models/Medication');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const {
  sendReminderSMS,
  enrichMedication,
  getCanonicalMobile,
  findDueMedications,
} = require('../services/medicationService');
const { sendWhatsApp, sendMedicationReminder } = require('../services/whatsappService');
const { sendMedicationReminderEmail, sendConfirmationEmail } = require('../notifications/medication.email');

const TIME_RE = /(\b\d{1,2})(?::(\d{2}))?\s?(am|pm)?\b/gi;
const DOSAGE_RE = /(\b\d+(?:\.\d+)?\s?(mg|mcg|g|ml|iu|units|tablet|tab|capsule|caps)\b)/i;

const normalizeTime = (h, m, ap) => {
  let hh = parseInt(h, 10);
  const mm = m ? parseInt(m, 10) : 0;
  const mer = (ap || '').toLowerCase();
  if (mer === 'pm' && hh < 12) hh += 12;
  if (mer === 'am' && hh === 12) hh = 0;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

const extractTimes = (text) => {
  const times = new Set();
  let match;
  while ((match = TIME_RE.exec(text))) {
    const normalized = normalizeTime(match[1], match[2], match[3]);
    if (normalized) times.add(normalized);
  }
  if (/morning/i.test(text)) times.add('08:00');
  if (/noon|midday|lunch/i.test(text)) times.add('13:00');
  if (/evening/i.test(text)) times.add('19:00');
  if (/night|bedtime/i.test(text)) times.add('22:00');
  return Array.from(times);
};

const extractDosage = (text) => {
  const match = text.match(DOSAGE_RE);
  return match ? match[1].trim() : '';
};

const parseLines = (rawText) => {
  const lines = String(rawText || '')
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const times = extractTimes(line);
      const dosage = extractDosage(line);
      let name = line;
      if (dosage) name = name.replace(dosage, '');
      times.forEach((t) => {
        name = name.replace(t, '');
      });
      name = name.replace(/\b(am|pm)\b/gi, '').replace(/[-–|,:]+/g, ' ').trim();
      if (!name) return null;
      return { name, dosage, times };
    })
    .filter(Boolean);
};

/* ─── Validators ─── */
const PHONE_RE = /^[\+]?[\d\s\-()]{10,20}$/;

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  if (!PHONE_RE.test(phone.trim())) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

/* ─── List ─── */
exports.list = asyncHandler(async (req, res) => {
  const items = await Medication.find({ user: req.user._id }).sort({ active: -1, updatedAt: -1 }).lean();
  res.json({
    success: true,
    medications: items.map(enrichMedication),
    canonicalMobile: await getCanonicalMobile(req.user._id),
  });
});

/* ─── Create ─── */
exports.create = asyncHandler(async (req, res) => {
  const {
    name,
    dosage = '',
    notes = '',
    duration = '',
    effects = '',
    effectNotes = '',
    timing = '',
    times = [],
    frequency = 'daily',
    mobileNumber,
    countryCode = '+91',
    reminderEmail = '',
    enableWhatsApp = true,
    enableEmail = true,
    color,
    icon,
    startDate,
    endDate,
  } = req.body || {};

  if (!name || !name.trim()) throw new ApiError(400, 'Medication name is required');
  if (!validatePhone(mobileNumber)) {
    throw new ApiError(
      400,
      'A valid mobile number is required so we can remind you on time. (10–15 digits)'
    );
  }

  const confirmationToken = uuidv4();

  const medDoc = await Medication.create({
    user: req.user._id,
    name: name.trim(),
    dosage: dosage.trim(),
    notes: notes.trim(),
    duration: duration.trim(),
    effects,
    effectNotes: effectNotes.trim(),
    timing,
    times: Array.isArray(times) ? times : [],
    frequency,
    mobileNumber: mobileNumber.trim(),
    countryCode: countryCode.trim(),
    reminderEmail: (reminderEmail || '').trim(),
    enableWhatsApp: enableWhatsApp !== false,
    enableEmail: enableEmail !== false,
    verified: false,
    confirmationToken,
    color,
    icon,
    startDate: startDate ? new Date(startDate) : new Date(),
    endDate: endDate ? new Date(endDate) : null,
  });

  // Auto-generate routine after adding medication
  try {
    const { generateRoutine } = require('../services/routineService');
    await generateRoutine(req.user._id);
  } catch (e) { /* non-critical */ }

  const timesList = (Array.isArray(times) ? times : []).join(', ');

  // Fetch user name for emails
  let userName = 'there';
  try {
    const user = await User.findById(req.user._id).select('name').lean();
    if (user?.name) userName = user.name;
  } catch {}

  // Send WhatsApp notification (non-blocking)
  if (enableWhatsApp !== false) {
    try {
      sendWhatsApp(mobileNumber.trim(), `✅ Medication added: ${name.trim()}${dosage ? ` (${dosage.trim()})` : ''}\nReminders set for: ${timesList}\n\n📱 You'll receive WhatsApp reminders at these times.\n— WITH_U`);
    } catch (e) { /* non-critical */ }
  }

  // Send confirmation email (must confirm before reminders activate)
  let emailResult = null;
  if (enableEmail !== false && reminderEmail) {
    try {
      emailResult = await sendConfirmationEmail({
        to: reminderEmail.trim(),
        medName: name.trim(),
        dosage: dosage.trim(),
        times: Array.isArray(times) ? times : [],
        icon,
        userName,
        confirmationToken,
        medId: medDoc._id.toString(),
      });
    } catch (e) { /* non-critical */ }
  }

  res.status(201).json({
    success: true,
    medication: enrichMedication(medDoc.toObject()),
    confirmationEmailSent: !!(emailResult?.success),
    message: reminderEmail
      ? 'Medication added! Check your email to confirm reminders.'
      : 'Medication added! Add an email to enable email reminders.',
  });
});

/* ─── Update ─── */
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = [
    'name', 'dosage', 'notes', 'duration', 'effects', 'effectNotes', 'timing',
    'times', 'frequency', 'mobileNumber', 'countryCode', 'reminderEmail',
    'enableWhatsApp', 'enableEmail', 'color', 'icon',
    'startDate', 'endDate', 'active',
  ];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  if (update.mobileNumber && !validatePhone(update.mobileNumber)) {
    throw new ApiError(400, 'Mobile number must be 10–15 digits.');
  }

  const med = await Medication.findOneAndUpdate(
    { _id: id, user: req.user._id },
    update,
    { new: true }
  );
  if (!med) throw new ApiError(404, 'Medication not found');
  res.json({ success: true, medication: enrichMedication(med.toObject()) });
});

/* ─── Remove ─── */
exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await Medication.findOneAndDelete({ _id: id, user: req.user._id });
  if (!result) throw new ApiError(404, 'Medication not found');
  res.json({ success: true });
});

/* ─── Mark taken ─── */
exports.markTaken = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const med = await Medication.findOne({ _id: id, user: req.user._id });
  if (!med) throw new ApiError(404, 'Medication not found');

  const last = med.lastTakenAt;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // streak grows if last dose was within ~36h
  if (last && now - last < 36 * 3600 * 1000) med.streak += 1;
  else med.streak = 1;
  med.lastTakenAt = now;

  // Log adherence for today
  const todayLog = med.adherenceLog.find(
    (l) => l.date && l.date.toISOString().slice(0, 10) === today
  );
  if (todayLog) {
    todayLog.taken = true;
    todayLog.takenAt = now;
  } else {
    med.adherenceLog.push({ date: now, taken: true, takenAt: now });
  }

  // Keep only last 30 days of adherence
  if (med.adherenceLog.length > 30) {
    med.adherenceLog = med.adherenceLog.slice(-30);
  }

  await med.save();

  res.json({ success: true, medication: enrichMedication(med.toObject()) });
});

/* ─── Send a manual reminder now ─── */
exports.remindNow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const med = await Medication.findOne({ _id: id, user: req.user._id });
  if (!med) throw new ApiError(404, 'Medication not found');

  const dosage = med.dosage ? ` (${med.dosage})` : '';
  const now = new Date();
  const timeStr = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
  const results = { whatsapp: null, email: null, sms: null };

  // Fetch user name for email
  let userName = 'there';
  try {
    const user = await User.findById(req.user._id).select('name').lean();
    if (user?.name) userName = user.name;
  } catch {}

  // ── WhatsApp Reminder ──
  if (med.enableWhatsApp !== false && med.mobileNumber) {
    try {
      results.whatsapp = await sendMedicationReminder(
        med.mobileNumber, med.name, med.dosage, timeStr
      );
    } catch (err) {
      results.whatsapp = { success: false, error: err.message };
    }
  }

  // ── Email Reminder ──
  if (med.enableEmail !== false && med.reminderEmail) {
    try {
      results.email = await sendMedicationReminderEmail({
        to: med.reminderEmail,
        medName: med.name,
        dosage: med.dosage,
        time: timeStr,
        notes: med.notes,
        icon: med.icon,
        userName,
      });
    } catch (err) {
      results.email = { success: false, error: err.message };
    }
  }

  // ── SMS (legacy fallback) ──
  const smsText = `💊 Time for ${med.name}${dosage}. Take whenever you're ready. — WITH_U`;
  results.sms = await sendReminderSMS(`${med.countryCode}${med.mobileNumber}`, smsText);

  med.lastReminderAt = now;
  await med.save();

  // Build channel summary for response
  const channels = [];
  if (results.whatsapp?.success) channels.push('WhatsApp');
  if (results.email?.success) channels.push('Email');
  if (results.sms?.ok) channels.push('SMS');

  res.json({
    success: true,
    channels,
    whatsapp: results.whatsapp,
    email: results.email,
    sms: results.sms,
    notification: {
      title: `Time for ${med.name}`,
      body: `${med.dosage || 'Tap to mark as taken'} · Sent via ${channels.join(' + ') || 'notification'}`,
      icon: med.icon,
      color: med.color,
      ts: Date.now(),
    },
  });
});

/* ─── List medications that are due right now (polled from client) ─── */
exports.due = asyncHandler(async (req, res) => {
  const items = await findDueMedications(req.user._id);
  res.json({ success: true, due: items, ts: Date.now() });
});

/* ─── Mark that the client has shown the reminder (dedupe) ─── */
exports.acknowledgeReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const med = await Medication.findOne({ _id: id, user: req.user._id });
  if (!med) throw new ApiError(404, 'Medication not found');

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // Add current slot to remindedSlots to prevent re-firing
  if (med.times?.length) {
    const minsNow = now.getHours() * 60 + now.getMinutes();
    for (const t of med.times) {
      const [h, m] = t.split(':').map(Number);
      const mins = h * 60 + m;
      // If this time slot is within the last 15 min, mark it
      if (minsNow >= mins && minsNow - mins <= 15) {
        const key = `${today}|${t}`;
        if (!med.remindedSlots.includes(key)) {
          med.remindedSlots.push(key);
        }
      }
    }
  }

  // Clean old slot entries (keep only today's)
  med.remindedSlots = med.remindedSlots.filter(s => s.startsWith(today));
  med.lastReminderAt = now;
  await med.save();

  res.json({ success: true, medication: enrichMedication(med.toObject()) });
});

/* ─── Canonical mobile lookup (used by other parts of app) ─── */
exports.canonicalMobile = asyncHandler(async (req, res) => {
  const data = await getCanonicalMobile(req.user._id);
  res.json({ success: true, mobile: data });
});

/* ─── Parse uploaded or pasted medication schedule ─── */
exports.parse = asyncHandler(async (req, res) => {
  let text = req.body?.text;
  if (req.file?.buffer) {
    text = req.file.buffer.toString('utf-8');
  }
  if (!text || !String(text).trim()) {
    throw new ApiError(400, 'text or file is required');
  }
  const items = parseLines(text);
  res.json({ success: true, items });
});

/* ─── Confirm email (PUBLIC — no auth needed, user clicks link from email) ─── */
exports.confirmEmail = asyncHandler(async (req, res) => {
  const { token, id } = req.query;
  if (!token || !id) {
    return res.status(400).send(buildConfirmPage(false, 'Missing confirmation token or ID.'));
  }

  const med = await Medication.findById(id);
  if (!med) {
    return res.status(404).send(buildConfirmPage(false, 'Medication not found. It may have been deleted.'));
  }
  if (med.confirmationToken !== token) {
    return res.status(400).send(buildConfirmPage(false, 'Invalid confirmation token.'));
  }
  if (med.verified) {
    return res.send(buildConfirmPage(true, `Your reminders for <strong>${med.name}</strong> are already active!`));
  }

  med.verified = true;
  med.emailVerifiedAt = new Date();
  await med.save();

  const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  res.send(buildConfirmPage(true, `Your reminders for <strong>${med.name}</strong>${med.dosage ? ` (${med.dosage})` : ''} are now active! You'll receive email reminders at your scheduled times.`, BASE_URL));
});

/* ─── Resend confirmation email ─── */
exports.resendConfirmation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const med = await Medication.findOne({ _id: id, user: req.user._id });
  if (!med) throw new ApiError(404, 'Medication not found');

  if (med.verified) {
    return res.json({ success: true, message: 'Already verified', verified: true });
  }
  if (!med.reminderEmail) {
    throw new ApiError(400, 'No email address set for this medication');
  }

  // Generate new token
  med.confirmationToken = uuidv4();
  await med.save();

  let userName = 'there';
  try {
    const user = await User.findById(req.user._id).select('name').lean();
    if (user?.name) userName = user.name;
  } catch {}

  const result = await sendConfirmationEmail({
    to: med.reminderEmail,
    medName: med.name,
    dosage: med.dosage,
    times: med.times,
    icon: med.icon,
    userName,
    confirmationToken: med.confirmationToken,
    medId: med._id.toString(),
  });

  res.json({ success: true, emailSent: result.success, message: 'Confirmation email re-sent. Check your inbox.' });
});

/* ─── Helper: Build confirmation HTML page ─── */
function buildConfirmPage(success, message, dashboardUrl) {
  const color = success ? '#34d399' : '#f87171';
  const icon = success ? '✅' : '❌';
  const dashLink = dashboardUrl
    ? `<a href="${dashboardUrl}/smart-medication" style="display:inline-block;margin-top:20px;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:12px;text-decoration:none;font-weight:600">Open WITH_U Dashboard</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${success ? 'Reminders Activated' : 'Confirmation Failed'} — WITH_U</title>
<style>
  body { margin:0; padding:0; background:#0f0a1a; font-family:'Segoe UI',Roboto,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .card { max-width:440px; margin:20px; background:rgba(255,255,255,0.05); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:48px 36px; text-align:center; }
  .icon { font-size:64px; margin-bottom:16px; }
  h1 { color:#fff; font-size:24px; margin:0 0 12px; }
  p { color:rgba(255,255,255,0.7); font-size:15px; line-height:1.6; margin:0; }
  .badge { display:inline-block; margin-top:16px; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:600; background:${color}22; color:${color}; border:1px solid ${color}44; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${success ? 'Reminders Activated!' : 'Confirmation Failed'}</h1>
    <p>${message}</p>
    <div class="badge">${success ? '🔔 Email reminders are ON' : '⚠️ Please try again'}</div>
    ${dashLink}
  </div>
</body>
</html>`;
}

