const Medication = require('../models/Medication');
const Routine = require('../models/Routine');
const logger = require('../utils/logger');

/**
 * Generate a daily routine from user's medications
 */
const generateRoutine = async (userId) => {
  const meds = await Medication.find({ user: userId, active: true }).lean();

  const schedule = [];

  meds.forEach(med => {
    (med.times || []).forEach(time => {
      schedule.push({
        time,
        task: `Take ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
        medicationId: med._id,
        type: 'medication',
      });
    });
  });

  // Sort by time
  schedule.sort((a, b) => a.time.localeCompare(b.time));

  // Add buffer reminders (15 min before each med)
  const buffers = [];
  schedule.forEach(s => {
    const [h, m] = s.time.split(':').map(Number);
    let bm = m - 15;
    let bh = h;
    if (bm < 0) { bm += 60; bh -= 1; }
    if (bh >= 0) {
      buffers.push({
        time: `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`,
        task: `Prepare for: ${s.task}`,
        type: 'buffer',
      });
    }
  });

  const fullSchedule = [...schedule, ...buffers].sort((a, b) => a.time.localeCompare(b.time));

  // Upsert routine
  const routine = await Routine.findOneAndUpdate(
    { user: userId },
    { dailySchedule: fullSchedule, generatedAt: new Date() },
    { upsert: true, new: true }
  );

  logger.info(`[Routine] Generated ${fullSchedule.length} tasks for user ${userId}`);
  return routine;
};

/**
 * Get routine for a user
 */
const getRoutine = async (userId) => {
  let routine = await Routine.findOne({ user: userId }).lean();
  if (!routine) {
    routine = await generateRoutine(userId);
  }
  return routine;
};

module.exports = { generateRoutine, getRoutine };
