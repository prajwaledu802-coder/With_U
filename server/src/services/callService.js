/**
 * Calling service — Twilio + Retell AI integration.
 * 
 * Flow:
 * 1. Register a call with Retell AI → get call_id
 * 2. Use Twilio to call the user's phone
 * 3. Twilio dials Retell's SIP URI with the call_id
 * 4. User picks up → talks to the Retell AI agent naturally
 */
const axios = require('axios');
const twilio = require('twilio');
const logger = require('../utils/logger');

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;
const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

const twilioClient = (TWILIO_SID && TWILIO_TOKEN) ? twilio(TWILIO_SID, TWILIO_TOKEN) : null;

/**
 * Register a phone call with Retell AI to get a call_id
 */
const registerRetellCall = async (fromNumber, toNumber, userName) => {
  const { data } = await axios.post('https://api.retellai.com/v2/register-phone-call', {
    agent_id: RETELL_AGENT_ID,
    from_number: fromNumber,
    to_number: toNumber,
    direction: 'outbound',
    retell_llm_dynamic_variables: {
      customer_name: userName || 'friend',
    },
    metadata: { source: 'with_u', userName },
  }, {
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  logger.info(`[RetellAI] Registered call — call_id: ${data.call_id}, agent: ${data.agent_id}`);
  return data;
};

/**
 * Trigger an AI agent call via Twilio + Retell.
 * Twilio calls the user's phone, then connects audio to Retell AI agent.
 */
const triggerAICall = async (phone, userName = 'friend') => {
  if (!twilioClient || !RETELL_API_KEY || !RETELL_AGENT_ID) {
    logger.info(`[CALL:mock] → ${phone} (missing credentials)`);
    return { ok: false, error: 'Twilio or Retell AI not configured' };
  }

  const toNumber = phone; // Already E.164 formatted by controller

  try {
    // Step 1: Register the call with Retell AI
    const retellData = await registerRetellCall(TWILIO_FROM, toNumber, userName);
    const callId = retellData.call_id;

    // Step 2: Use Twilio to call user and connect to Retell AI agent via SIP
    const call = await twilioClient.calls.create({
      to: toNumber,
      from: TWILIO_FROM,
      twiml: `<Response><Dial><Sip>sip:${callId}@sip.retellai.com;transport=tls</Sip></Dial></Response>`,
    });

    logger.info(`[CALL] Twilio call to ${toNumber} — SID: ${call.sid}, Retell call_id: ${callId}`);
    return {
      ok: true,
      sid: call.sid,
      retellCallId: callId,
      to: toNumber,
    };
  } catch (err) {
    const errMsg = err.response?.data?.error_message || err.message;
    logger.error(`[CALL] Failed:`, errMsg);
    return { ok: false, error: errMsg };
  }
};

/**
 * Trigger a call to a saved emergency contact (basic TwiML).
 */
const triggerContactCall = async (contactPhone, userName = 'A friend') => {
  if (!twilioClient) {
    return { ok: false, error: 'Twilio not configured' };
  }

  const twiml = `<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Hello. This is an automated call from WITH-U, a wellness companion.
    ${userName} may need your support right now.
    Please try reaching out to them when you can.
    Thank you for being there.
  </Say>
</Response>`;

  try {
    const call = await twilioClient.calls.create({
      to: contactPhone,
      from: TWILIO_FROM,
      twiml,
    });
    logger.info(`[CALL] Contact call to ${contactPhone} — SID: ${call.sid}`);
    return { ok: true, sid: call.sid, to: contactPhone };
  } catch (err) {
    logger.error('[CALL] Contact call error:', err.message);
    return { ok: false, error: err.message };
  }
};

module.exports = { triggerAICall, triggerContactCall };
