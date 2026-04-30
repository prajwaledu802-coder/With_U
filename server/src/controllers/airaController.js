const asyncHandler = require('../utils/asyncHandler');
const Medication = require('../models/Medication');
const { getRoutine } = require('../services/routineService');
const { enrichMedication } = require('../services/medicationService');

// POST /api/aira/context — returns context for the AI companion
exports.context = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get active medications
  const meds = await Medication.find({ user: userId, active: true }).sort({ updatedAt: -1 }).lean();
  const enriched = meds.map(enrichMedication);

  // Find next medication
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let nextMed = null;

  for (const m of enriched) {
    for (const t of (m.times || [])) {
      const [h, mm] = t.split(':').map(Number);
      const tMin = h * 60 + mm;
      if (tMin > nowMin) {
        if (!nextMed || tMin < nextMed.timeMin) {
          const ap = h >= 12 ? 'PM' : 'AM';
          const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          nextMed = {
            name: m.name,
            dosage: m.dosage,
            time: `${h12}:${String(mm).padStart(2, '0')} ${ap}`,
            timeMin: tMin,
          };
        }
        break;
      }
    }
  }

  // Get routine summary
  const routine = await getRoutine(userId);
  const routineSummary = (routine?.dailySchedule || [])
    .filter(s => s.type === 'medication')
    .map(s => `${s.time} — ${s.task}`);

  res.json({
    success: true,
    context: {
      nextMedication: nextMed,
      totalMedications: meds.length,
      routineSummary,
      currentTime: now.toISOString(),
    },
  });
});
