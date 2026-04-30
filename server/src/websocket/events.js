module.exports = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',

  // Chat
  CHAT_JOIN: 'chat:join',
  CHAT_LEAVE: 'chat:leave',
  CHAT_USER: 'chat:user',
  CHAT_AIRA: 'chat:aira',
  CHAT_TYPING: 'chat:typing',

  // Stress / emotion live
  STRESS_UPDATE: 'stress:update',
  EMOTION_UPDATE: 'emotion:update',

  // SOS / Calls
  SOS_TRIGGER: 'sos:trigger',
  SOS_ACK: 'sos:ack',
  CALL_INVITE: 'call:invite',
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  CALL_ICE: 'call:ice',
  CALL_END: 'call:end',

  // Notifications
  NOTIFICATION: 'notification',
  ERROR: 'error',
};
