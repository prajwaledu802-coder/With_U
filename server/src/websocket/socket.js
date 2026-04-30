/**
 * Socket.io gateway for live Aira sessions.
 * Mounts on the same HTTP server. Auth happens via Supabase access token in
 * the connection handshake (`auth: { token }`) — connections without a token
 * become anonymous "guest" rooms (still useful for the landing demo).
 */
const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');
const events = require('./events');
const { verifySupabaseToken } = require('../config/supabase');
const llm = require('../ai/llm');
const prompt = require('../ai/prompt.engine');
const stressEngine = require('../ai/stress.engine');
const { decideAction, getAnimation, shouldTriggerSOS } = require('../ai/decision.engine');
const emotionService = require('../services/emotion.service');
const conversationService = require('../services/conversation.service');
const stressService = require('../services/stress.service');
const callService = require('../services/call.service');

let io = null;

const attach = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl?.split(',') || '*',
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.use(async (socket, next) => {
    const token = socket.handshake?.auth?.token || null;
    socket.data.guest = true;
    socket.data.userId = null;
    if (token) {
      try {
        const u = await verifySupabaseToken(token);
        socket.data.userId = u.id || u.sub;
        socket.data.email = u.email;
        socket.data.guest = false;
      } catch (err) {
        logger.warn('[ws] auth failed:', err.message);
      }
    }
    next();
  });

  io.on(events.CONNECT, (socket) => {
    const tag = socket.data.guest ? `guest:${socket.id.slice(0, 6)}` : `user:${socket.data.userId}`;
    logger.info(`[ws] connected ${tag}`);

    socket.on(events.CHAT_JOIN, ({ room }) => {
      const target = room || (socket.data.userId ? `u:${socket.data.userId}` : `g:${socket.id}`);
      socket.join(target);
      socket.emit(events.NOTIFICATION, { type: 'joined', room: target });
    });

    socket.on(events.CHAT_USER, async (payload, ack) => {
      const text = (payload?.text || '').trim();
      if (!text) return ack?.({ ok: false, message: 'empty' });
      const userName = payload.userName || 'friend';
      const language = payload.language || 'en';
      const room = payload.room || `u:${socket.data.userId}` || `g:${socket.id}`;

      try {
        const emotionEntry = await emotionService.fromText(text);
        const stress = stressEngine.computeWeighted(payload.signals || {}, emotionEntry.stressScore);
        const action = decideAction(stress.level, [], {});

        const history = socket.data.userId
          ? await conversationService.recallContext(socket.data.userId)
          : [];
        const sysPrompt = prompt.buildChatPrompt(text, {
          userName, language, stressLevel: stress.level, history,
        });
        const reply = await llm.generateText(sysPrompt, {
          userName, emotion: emotionEntry.emotion, history,
        });

        if (socket.data.userId) {
          await conversationService.rememberTurn(socket.data.userId, {
            role: 'user', text, ts: Date.now(), stressScore: stress.total, emotion: emotionEntry.emotion,
          });
          await conversationService.rememberTurn(socket.data.userId, {
            role: 'aira', text: reply.text, ts: Date.now(),
          });
          await stressService.log(socket.data.userId, {
            score: stress.total,
            level: stress.level,
            breakdown: stress.breakdown,
            source: 'text',
            triggeredSOS: shouldTriggerSOS(stress.total),
          });
        }

        const event = {
          reply: reply.text,
          emotion: emotionEntry.emotion,
          stress: { score: stress.total, level: stress.level, breakdown: stress.breakdown },
          animation: getAnimation(stress.total),
          action,
          source: reply.source,
        };

        io.to(room).emit(events.CHAT_AIRA, event);
        io.to(room).emit(events.STRESS_UPDATE, event.stress);
        io.to(room).emit(events.EMOTION_UPDATE, { emotion: event.emotion });

        if (shouldTriggerSOS(stress.total) && socket.data.userId) {
          io.to(room).emit(events.SOS_TRIGGER, { stressScore: stress.total });
        }
        ack?.({ ok: true, ...event });
      } catch (err) {
        logger.error('[ws] chat err:', err.message);
        ack?.({ ok: false, message: err.message });
      }
    });

    socket.on(events.SOS_TRIGGER, async (payload, ack) => {
      try {
        if (!socket.data.userId) return ack?.({ ok: false, message: 'guest' });
        const r = await callService.triggerSOS({
          userId: socket.data.userId,
          userName: payload?.userName || 'a friend',
          stressScore: Number(payload?.stressScore || 80),
          message: payload?.message,
        });
        socket.emit(events.SOS_ACK, r);
        ack?.({ ok: true, ...r });
      } catch (err) {
        ack?.({ ok: false, message: err.message });
      }
    });

    // WebRTC signalling fanout
    socket.on(events.CALL_OFFER, ({ room, offer }) => socket.to(room).emit(events.CALL_OFFER, { offer, from: socket.id }));
    socket.on(events.CALL_ANSWER, ({ room, answer }) => socket.to(room).emit(events.CALL_ANSWER, { answer, from: socket.id }));
    socket.on(events.CALL_ICE, ({ room, candidate }) => socket.to(room).emit(events.CALL_ICE, { candidate, from: socket.id }));
    socket.on(events.CALL_END, ({ room }) => socket.to(room).emit(events.CALL_END, { from: socket.id }));

    socket.on(events.DISCONNECT, () => {
      logger.info(`[ws] disconnected ${tag}`);
    });
  });

  return io;
};

const get = () => io;

const broadcast = (room, event, payload) => {
  if (!io) return;
  io.to(room).emit(event, payload);
};

module.exports = { attach, get, broadcast };
