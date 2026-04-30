/**
 * Periodic check that scans recent stress for unaddressed spikes and pushes
 * a soft companion notification through the websocket.
 */
const StressEntry = require('../models/stress.model');
const push = require('../notifications/push.service');
const logger = require('../utils/logger');

const runOnce = async () => {
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000); // last 5 minutes
    const recent = await StressEntry.find({
      createdAt: { $gte: since },
      level: { $in: ['high', 'critical'] },
    }).lean();

    const seen = new Set();
    for (const r of recent) {
      const id = String(r.user);
      if (seen.has(id)) continue;
      seen.add(id);
      await push.send(id, {
        type: 'gentle_check_in',
        title: 'Aira is here',
        body: 'Want to take a slow breath together?',
        stressScore: r.score,
      });
    }
    if (seen.size) logger.info(`[job:notify] pushed gentle check-in to ${seen.size}`);
  } catch (err) {
    logger.warn('[job:notify] failed:', err.message);
  }
};

const start = () => {
  setInterval(runOnce, 5 * 60 * 1000);
  logger.info('[job:notify] scheduled (5 min)');
};

module.exports = { start, runOnce };
