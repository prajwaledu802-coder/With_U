/**
 * Real-time push notifications.
 * Currently a thin wrapper around the websocket broadcaster — drop in FCM/APNS later
 * by adding a transport here without changing call sites.
 */
const ws = require('../websocket/socket');
const events = require('../websocket/events');
const logger = require('../utils/logger');

const send = async (userId, payload) => {
  const room = `u:${userId}`;
  try {
    ws.broadcast(room, events.NOTIFICATION, {
      ts: Date.now(),
      ...payload,
    });
    return { success: true, channel: 'ws', room };
  } catch (err) {
    logger.warn('[push] broadcast failed:', err.message);
    return { success: false, message: err.message };
  }
};

const sendToAll = async (payload) => {
  const io = ws.get();
  if (!io) return { success: false, message: 'ws not ready' };
  io.emit(events.NOTIFICATION, { ts: Date.now(), ...payload });
  return { success: true };
};

module.exports = { send, sendToAll };
