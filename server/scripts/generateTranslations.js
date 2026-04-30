/**
 * Generate i18n translations for all Indian languages using Gemini.
 * Run: node scripts/generateTranslations.js
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LANGUAGES = [
  { code: 'kn', name: 'Kannada' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
];

// Key sections to translate (subset of English keys for UI)
const KEYS_TO_TRANSLATE = {
  nav: { home: 'Home', companion: 'AI Companion', relief: 'Quick Relief', medications: 'Smart Medication', dashboard: 'Dashboard', settings: 'Settings', logout: 'Sign out', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search' },
  sidebar: { dashboard: 'Dashboard', relief: 'Quick Relief', companion: 'AI Companion', medications: 'Smart Medication', settings: 'Settings', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search' },
  hero: { title: 'You take care of everyone.', title2: "We're here for you.", subtitle: 'A quiet companion that understands your stress — without asking.', ctaPrimary: 'Begin gently', ctaGhost: 'Read our story' },
  dashboard: { moodTitle: 'How the days have felt', speakTitle: "What's on your mind?", speakPlaceholder: "Type a sentence, or just speak. There's no right answer.", send: 'Share gently', speak: 'Speak instead', recording: 'Listening...', suggestions: 'A small kindness', resources: 'Quiet practices', recent: 'Recent moments', empty: "No moments yet — share one when you're ready.", stressLow: 'A lighter day', stressMid: 'A bit heavy', stressHigh: 'Carrying a lot', talkToAira: 'Talk to Aira' },
  settings: { title: 'Settings', appearance: 'Appearance', theme: 'Theme', language: 'Language', save: 'Save', voiceResponses: 'Voice responses' },
  common: { loading: 'A moment...', save: 'Save', cancel: 'Cancel', delete: 'Remove', confirm: 'Confirm', back: 'Back' },
  erCompanion: { chat: 'Chat', placeholder: 'Say something, or just sit here…', withUIsHere: 'With_U is here…', hearingYou: 'hearing you' },
  dashCards: { companion: 'AI Companion', medication: 'Smart Medication', relief: 'Quick Relief', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search', focusToday: 'What would you like to focus on today?' },
  mood: { title: 'MoodSense Companion', enableCamera: 'Enable Camera', stressLevel: 'Stress Level', suggestions: 'Suggestions', calm: 'Calm', moderate: 'Moderate', highStress: 'High Stress' },
  relief: { title: 'Quick Relief', breathing: 'Breathing Reset', audio: 'Calm Audio', reset: 'Reset Pause', gratitude: 'Gratitude', quiet: 'Quiet Mode' },
  meds: { title: 'Smart Medication', subtitle: 'Gentle reminders that travel with you.', addTitle: 'Add medication', add: 'Add', taken: 'Taken', remind: 'Remind' },
  gentle: { title: 'Gentle Search', searchPlaceholder: 'Search resources...' },
};

async function translateBatch(langName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Translate this JSON to ${langName}. Keep JSON keys exactly the same, only translate the string values. Use natural, warm ${langName} language. Keep brand names like "WITH_U", "MoodSense", "GentleReach", "Aira" untranslated. Return ONLY valid JSON, no markdown.

${JSON.stringify(KEYS_TO_TRANSLATE, null, 2)}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(raw);
}

async function main() {
  const output = {};
  for (const lang of LANGUAGES) {
    console.log(`Translating to ${lang.name}...`);
    try {
      output[lang.code] = await translateBatch(lang.name);
      console.log(`  ✓ ${lang.name} done`);
    } catch (err) {
      console.error(`  ✗ ${lang.name} failed:`, err.message);
      output[lang.code] = {};
    }
  }

  const outPath = path.join(__dirname, '..', '..', 'client', 'src', 'utils', 'translations.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main();
