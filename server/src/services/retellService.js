/**
 * Retell AI Voice Agent Service
 * Supports both Web Calls (browser) and Phone Calls
 */
const axios = require('axios');
const logger = require('../utils/logger');

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;
const RETELL_FROM = process.env.RETELL_FROM_NUMBER;
const BASE = 'https://api.retellai.com/v2';

const headers = () => ({
  'Authorization': `Bearer ${RETELL_API_KEY}`,
  'Content-Type': 'application/json',
});

const isEnabled = () => !!(RETELL_API_KEY && RETELL_AGENT_ID);

/**
 * Create a Web Call — user talks through browser mic/speaker.
 * Returns an access_token for the Retell client SDK.
 */
const createWebCall = async (opts = {}) => {
  if (!isEnabled()) {
    logger.info('[RetellAI-MOCK] Web call (no API key)');
    return { success: false, error: 'Retell AI not configured' };
  }

  try {
    const { data } = await axios.post(`${BASE}/create-web-call`, {
      agent_id: RETELL_AGENT_ID,
      ...(opts.metadata ? { metadata: opts.metadata } : {}),
      ...(opts.dynamicVars ? { retell_llm_dynamic_variables: opts.dynamicVars } : {}),
    }, { headers: headers(), timeout: 15000 });

    logger.info(`[RetellAI] Web call created — call_id: ${data.call_id}`);
    return {
      success: true,
      call_id: data.call_id,
      access_token: data.access_token,
      agent_id: data.agent_id,
      status: data.call_status,
    };
  } catch (err) {
    const errMsg = err.response?.data?.error_message || err.message;
    logger.error('[RetellAI] Web call failed:', errMsg);
    return { success: false, error: errMsg };
  }
};

/**
 * Create a Phone Call (requires from_number imported into Retell).
 */
const createPhoneCall = async (toNumber, opts = {}) => {
  const phone = toNumber.startsWith('+') ? toNumber : `+91${toNumber.replace(/\D/g, '')}`;

  if (!isEnabled() || !RETELL_FROM) {
    logger.info(`[RetellAI-MOCK] Would phone call ${phone}`);
    return { success: false, error: 'Phone calls require an imported Retell number' };
  }

  try {
    const { data } = await axios.post(`${BASE}/create-phone-call`, {
      from_number: RETELL_FROM,
      to_number: phone,
      agent_id: RETELL_AGENT_ID,
      ...(opts.metadata ? { metadata: opts.metadata } : {}),
    }, { headers: headers(), timeout: 15000 });

    logger.info(`[RetellAI] Phone call to ${phone} — call_id: ${data.call_id}`);
    return { success: true, call_id: data.call_id, to: phone, status: data.call_status };
  } catch (err) {
    const errMsg = err.response?.data?.error_message || err.message;
    logger.error(`[RetellAI] Phone call failed to ${phone}:`, errMsg);
    return { success: false, error: errMsg, to: phone };
  }
};

module.exports = { createWebCall, createPhoneCall, isEnabled };
