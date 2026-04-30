const elevenlabs = require('../integrations/elevenlabs');
const assemblyai = require('../integrations/assemblyai');

const speak = (text, opts = {}) => elevenlabs.synthesise(text, opts);
const transcribe = (buffer) => assemblyai.transcribeBuffer(buffer);
const listVoices = () => elevenlabs.listLiveVoices();
const presets = () => elevenlabs.getPresets();

module.exports = { speak, transcribe, listVoices, presets };
