/**
 * ElevenLabs facade.
 * Re-exports the existing elevenLabsService and adds a multilingual voice list.
 */
const base = require('../services/elevenLabsService');

const VOICE_PRESETS = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', label: 'Calm female (default)', languages: ['en', 'hi', 'multilingual'] },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', label: 'Soft female', languages: ['en', 'hi', 'multilingual'] },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', label: 'Strong female', languages: ['en', 'multilingual'] },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', label: 'Warm male', languages: ['en', 'hi', 'multilingual'] },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', label: 'Deep male', languages: ['en', 'multilingual'] },
];

const getPresets = () => VOICE_PRESETS;

const synthesise = (text, opts = {}) => base.synthesizeSpeech(text, opts);
const listLiveVoices = () => base.listVoices();

module.exports = { synthesise, listLiveVoices, getPresets };
