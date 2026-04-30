import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations.json';

const en = {
  brand: 'WITH_U',
  greeting: { supporting: 'Supporting you, always' },
  nav: { home: 'Home', mission: 'Mission', features: 'Features', contact: 'Contact', getStarted: 'Get Started', login: 'Sign in', companion: 'AI Companion', relief: 'Quick Relief', medications: 'Smart Medication', dashboard: 'Dashboard', settings: 'Settings', logout: 'Sign out', profile: 'Profile', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search', callAira: 'Call Aira' },
  sidebar: { dashboard: 'Dashboard', features: 'Features', relief: 'Quick Relief', games: 'Game Zone', resources: 'Resources', gentlereach: 'GentleReach', companion: 'AI Companion', medications: 'Smart Medication', settings: 'Settings', insights: 'Stress Insights', routine: 'Daily Routine', music: 'Calming Music', support: 'Support & Calls', sectionCompanion: 'Companion', sectionDaily: 'Daily', sectionActivities: 'Activities', sectionSupport: 'Support', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search', callAira: 'Call Aira' },
  hero: { title: 'You take care of everyone.', title2: "We're here for you.", subtitle: 'A quiet companion that understands your stress — without asking.', ctaPrimary: 'Begin gently', ctaGhost: 'Read our story' },
  mission: { title: 'The weight nobody sees', body: "Caregiving is invisible work — long, quiet, and rarely paused. WITH_U listens softly, learns your rhythm, and offers small kindnesses when the load grows heavy. No labels. No clinical questions. Just a steady presence in the background of your day.", pillars: { invisible: { title: 'Invisible burden', body: 'We notice what others miss — without asking you to explain.' }, gentle: { title: 'Non-intrusive', body: "No nudges you didn't ask for. No alerts that stress you more." }, warm: { title: 'Emotional intelligence', body: 'Soft language. Human tone. Designed to feel like a friend.' } } },
  features: { title: 'Small things, gently done', subtitle: 'Everything is designed to feel invisible yet supportive', items: { journal: { title: 'Invisible journaling', body: "Speak or type a sentence. We listen. That's all you need to do." }, stress: { title: 'Stress detection', body: 'We notice patterns over days, not snapshots — and never label you.' }, nudges: { title: 'Gentle nudges', body: '"Maybe a small break." "A glass of water." Things you\'d say to a friend.' }, resources: { title: 'Quiet resources', body: 'Two-minute exercises and small reset rituals. Nothing heavy.' }, gentleReach: { title: 'GentleReach', body: 'A trusted person gets a soft note when life gets heavy. You stay in control.' }, privacy: { title: 'Privacy first', body: 'Your words stay yours. Encrypted. Never sold. Always erasable.' } } },
  contact: { title: 'A note to us', subtitle: 'We read every message. No auto-replies.', name: 'Your name', email: 'Email', message: "What you'd like to say", send: 'Send softly' },
  footer: { tagline: 'A quiet companion for those who carry others.', copyright: '© 2026 WITH_U. Made with care.', product: 'Product', company: 'Company', legal: 'Legal', about: 'About', careers: 'Careers', privacyPolicy: 'Privacy Policy', terms: 'Terms of Use', cookies: 'Cookie Policy', madeWith: 'Made with', forCarriers: 'for those who carry others' },
  auth: { signupTitle: 'Make a quiet space for yourself', loginTitle: 'Welcome back', name: 'Your name', email: 'Email', password: 'Password', signup: 'Create account', login: 'Sign in', google: 'Continue with Google', haveAccount: 'Already have an account?', noAccount: 'New here?', trustedContact: 'Add a trusted contact (optional)', contactName: 'Contact name', contactEmail: 'Contact email', switchSignup: 'Sign up', switchLogin: 'Sign in', or: 'or', welcomeBack: 'Welcome back', welcomeToWithU: 'Welcome to WITH_U', checkEmail: 'Check your email to confirm your account.' },
  dashboard: { moodTitle: 'How the days have felt', speakTitle: "What's on your mind?", speakPlaceholder: "Type a sentence, or just speak. There's no right answer.", send: 'Share gently', speak: 'Speak instead', recording: 'Listening...', suggestions: 'A small kindness', resources: 'Quiet practices', gentleReachOn: 'GentleReach is on', gentleReachOff: 'GentleReach is off', recent: 'Recent moments', empty: "No moments yet — share one when you're ready.", stressLow: 'A lighter day', stressMid: 'A bit heavy', stressHigh: 'Carrying a lot', goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening', hello: 'Hello', welcomeMsg: 'Welcome to WITH_U — your quiet companion for everyday wellbeing.', stress: 'Stress', today: 'today', open: 'Open', noMedScheduled: 'No medication scheduled', addMedNote: 'Add one to enable reminders across the app.', add: 'Add', nextDose: 'Next dose', markTaken: 'Mark taken', remindNow: 'Remind now', more: 'more', alwaysAvailable: 'Always available', exercises: 'exercises', talkToAira: 'Talk to Aira', companionDesc: 'Your quiet companion. Chat, listen, and feel heard.', reliefDesc: 'Use breathing, grounding, or reset tools when stress feels high.', medsDesc: 'Manage reminders, refills, and supportive routines in one place.', gentleReachDesc: 'A soft, automatic note to someone you trust when stress climbs.', addFirst: 'Add your first', active: 'active', on: 'On', off: 'Off' },
  settings: { title: 'Settings', appearance: 'Appearance', theme: 'Theme', language: 'Language', gentleReach: 'GentleReach', gentleReachBody: "A trusted person gets a soft note if your stress trend worsens over several days. You stay in control.", contacts: 'Trusted contacts', addContact: 'Add contact', privacy: 'Privacy', privacyMode: 'Hide my entries from device previews', save: 'Save', deleteAccount: 'Delete account', voiceResponses: 'Voice responses', nudgeFrequency: 'Nudge frequency', enableGentleReach: 'Enable GentleReach', dangerZone: 'Danger Zone', dangerBody: 'This will permanently delete your account, all logs, sentiment history, and contacts. This cannot be undone.', confirmDeletePrompt: 'Are you sure? Click to confirm.', yesDelete: 'Yes, delete everything', deleting: 'Deleting...', system: 'System', light: 'Light', dark: 'Dark', low: 'Low', medium: 'Medium', high: 'High', relationPlaceholder: 'Relation (e.g. Sister, Friend)', noContacts: 'No trusted contacts yet. Add one above.', primary: 'primary' },
  common: { loading: 'A moment...', save: 'Save', cancel: 'Cancel', delete: 'Remove', confirm: 'Confirm', back: 'Back', or: 'or' },
  erCompanion: { chat: 'Chat', placeholder: 'Say something, or just sit here…', takingYouTo: 'Taking you to', cancel: 'cancel', withUIsHere: 'With_U is here…', hearingYou: 'hearing you', invisibleStress: 'Invisible Stress', detectedEmotion: 'Detected Emotion', currentState: 'Current state', suggestedForYou: 'Suggested for you', trustedContacts: 'Trusted Contacts', reachOutPrompt: 'Would you like to reach out to someone you trust?', noContacts: 'No trusted contacts yet', contactName: 'Contact name:', phoneNumber: 'Phone number:' },
  landing: { gentlyListening: 'Gently listening', heroCardTime: 'a quiet moment ago', heroCardMsg: "You've been carrying a lot this week. Maybe a small pause — even five minutes — would feel kind today.", heroChip1: '🫂 a slow breath', heroChip2: '💧 water', heroChip3: '🌿 a short walk', listeningSoftly: 'Listening softly', stressTrend: 'Stress trend: improving', coreTitle: 'Explore the core Aira experience', coreSubtitle: 'Jump straight into the companion, relief tools, or medicine tracker.', companionTitle: 'Aira Companion', companionDesc: 'Talk, reflect, and receive calm guidance tailored to your moment.', reliefTitle: 'Quick Relief', reliefDesc: 'Use fast breathing, grounding, or reset tools when stress feels high.', medsTitle: 'Smart Medication', medsDesc: 'Manage reminders, refills, and supportive routines in one place.', open: 'Open', trusted: 'Trusted by caregivers across India', private: '100% private', noClinical: 'No clinical labels', howTitle: 'How it works', step1Title: 'Share a moment', step1Body: "Type a sentence or speak aloud. No structure needed — just what's on your mind.", step2Title: 'We listen gently', step2Body: 'Our AI notices patterns across days. We never judge or label — just quietly understand.', step3Title: 'Receive soft support', step3Body: 'A kind word. A micro-suggestion. A glass of water reminder. Small things that matter.', step4Title: 'GentleReach (if you choose)', step4Body: 'If stress lingers, a trusted person gets a soft note. You stay in complete control.', testimonialTitle: 'Quiet words from caregivers', ctaTitle: "You don't have to carry it alone", ctaBody: 'Begin gently. No commitments. No clinical forms. Just a quiet space that understands.', startJourney: 'Start your journey', freeToStart: 'Free to start', noCreditCard: 'No credit card', completePrivacy: 'Complete privacy', motherCaregiver: 'Mother & caregiver', sonCaring: 'Son caring for parents', familySupport: 'Family support', quote1: "I didn't realize how much I was carrying until WITH_U gently showed me.", quote2: "The fact that it never asks 'how are you' — and still knows — is what makes it different.", quote3: 'GentleReach saved my sister from burning out quietly. Just a soft note was enough.', yourCompanion: 'Your Companion' },
  relief: {
    title: 'Quick Relief', subtitle: 'Small tools for overwhelmed moments. Use them anytime.',
    tabExercises: 'Exercises', tabCondition: 'By Condition',
    breathing: 'Breathing Reset', breathingDesc: 'A one-minute breath reset.',
    audio: 'Calm Audio', audioDesc: 'Rain, waves, or piano.',
    reset: 'Reset Pause', resetDesc: 'Simple body cues to settle.',
    gratitude: 'Gratitude', gratitudeDesc: 'A small moment that felt okay.',
    checkin: 'Soft Check-in', checkinDesc: 'Three gentle questions.',
    quiet: 'Quiet Mode', quietDesc: 'Reduce motion and soften the UI.',
    breathingTitle: 'Breathing Exercise', breathingIn: 'Breathe in slowly...', breathingHold: 'Hold gently...', breathingOut: 'Release slowly...',
    breathingCycle: 'Cycle {{count}} · 4-7-8 breathing',
    audioTitle: 'Calming Sounds', audioSubtitle: 'Tap to play, tap again to stop', playing: 'Playing',
    soundRain: 'Gentle Rain', soundWaves: 'Ocean Waves', soundPiano: 'Soft Piano',
    resetTitle: 'Reset Pause', resetSubtitle: 'Physical cues to bring you back',
    resetCold: 'Hold something cold', resetColdDesc: 'Try cold water or an ice cube for a reset.',
    resetGround: '5-4-3-2-1 grounding', resetGroundDesc: 'Name 5 things you see, 4 you touch, 3 you hear.',
    resetTense: 'Tense and release', resetTenseDesc: 'Clench your fists for 5 seconds, then release.',
    resetMove: 'Move for 60 seconds', resetMoveDesc: 'Walk, stretch, or shake your hands.',
    gratitudeTitle: 'Gratitude Moment', gratitudeSubtitle: 'What is one small thing you feel okay about?',
    gratitudePlaceholder: "I'm grateful for...", gratitudeEmpty: 'Your gratitude notes appear here.',
    checkinTitle: 'Soft Check-in', checkinSubtitle: 'Three gentle questions, then we recalibrate.',
    checkinQ1: 'How are you feeling right now?', checkinQ2: 'Do you feel overwhelmed?', checkinQ3: 'Have you rested today?',
    checkinOpt0: 'Not really', checkinOpt1: 'A little', checkinOpt2: 'Some', checkinOpt3: 'Very',
    checkinSubmit: 'Submit',
    quietTitle: 'Quiet Mode', quietSubtitle: 'Reduce motion and soften the interface.',
    quietEnable: 'Enable Quiet Mode', quietDisable: 'Disable Quiet Mode',
    quietNote: 'Quiet Mode reduces animation intensity and helps the UI feel calmer.',
  },
  support: {
    title: 'Support is available', prompt: 'Would you like to reach out to someone you trust?',
    noContacts: 'No trusted contacts yet', call: 'Call', addContact: 'Add trusted contact',
    namePlaceholder: 'Name', phonePlaceholder: 'Phone', add: 'Add contact',
    ngos: 'Support options', reachOut: 'Reach support',
  },
  meds: {
    title: 'Smart Medication', subtitle: 'Gentle reminders that travel with you.',
    addTitle: 'Add medication', namePlaceholder: 'Medication name',
    dosagePlaceholder: 'Dosage (e.g. 500 mg)', timesPlaceholder: 'Times (e.g. 08:00, 20:00)',
    phonePlaceholder: 'Phone for reminders', add: 'Add',
    scheduleTitle: 'Daily schedule', noSchedule: 'No schedule yet',
    taken: 'Taken', remind: 'Remind',
  },
  dashCards: {
    companion: 'AI Companion', companionDesc: 'Talk, listen, and feel heard with your personal AI companion.',
    medication: 'Smart Medication', medicationDesc: 'Track medications, get SMS reminders, and personalized insights.',
    relief: 'Quick Relief', reliefDesc: 'Guided breathing, grounding exercises, and calming sounds.',
    moodsense: 'MoodSense Companion', moodsenseDesc: 'Real-time emotion detection & AI-powered wellness support.',
    gentleSearch: 'Gentle Search', gentleSearchDesc: 'Access support resources and contact someone you trust.',
    focusToday: 'What would you like to focus on today?',
    currentStatus: 'Current Status', recentActivity: 'Recent Activity',
    feelingOverwhelmed: 'Feeling Overwhelmed?', overwhelmedTip: 'You might benefit from a quick grounding session.',
    tryRelief: 'Try Quick Relief', completedSession: 'Completed a 10-minute session',
    breathingExercise: 'Box breathing exercise', ago: 'ago', yesterday: 'Yesterday',
  },
  mood: {
    title: 'MoodSense Companion', subtitle: 'Real-time emotion detection & AI-powered wellness support',
    allowCamera: 'Allow Camera Access', allowCameraDesc: 'Allow camera to understand your mood. We\'ll scan your facial expressions to provide real-time wellness support.',
    privacyNote: 'Your camera feed stays on-device. Nothing is recorded or sent.',
    enableCamera: 'Enable Camera', loadingModels: 'Loading AI models & starting camera…',
    cameraNotAvailable: 'Camera Not Available', cameraRequired: 'Camera access is required for mood detection. Please allow camera permissions.',
    tryAgain: 'Try Again', liveFeed: 'Live Feed', stop: 'Stop', noFace: 'No face',
    stressLevel: 'Stress Level', emotionTimeline: 'Emotion Timeline',
    aiCompanion: 'AI Companion', suggestions: 'Suggestions',
    breathingExercise: 'Breathing Exercise', breathingTechnique: '4-7-8 technique • Tap to start',
    breathing478: '4-7-8 Breathing', inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale',
    followCircle: 'Follow the expanding circle', cycle: 'Cycle',
    calm: 'Calm', moderate: 'Moderate', highStress: 'High Stress',
  },
  gentle: {
    title: 'Gentle Search', subtitle: 'Find support resources and reach out to trusted contacts.',
    searchPlaceholder: 'Search resources...', callAI: 'Call AI Support', callContact: 'Call Emergency Contact',
    supportResources: 'Support Resources', trustedContacts: 'Trusted Contacts',
  },
  callAira: {
    title: 'Talk to Aira', subtitle: 'Aira will call your phone and talk with you naturally using AI',
    readyToCall: 'Ready to call', callingPhone: 'Calling your phone...', pickUp: 'Pick up when your phone rings',
    callInitiated: 'Call initiated!', phoneRinging: 'Your phone is ringing. Pick up to talk to Aira.',
    callFailed: 'Call failed', callNow: 'Call Aira Now', cancel: 'Cancel', done: 'Done',
    phoneLabel: 'Your Phone Number', phonePlaceholder: 'Enter phone number',
    invalidPhone: 'Enter a valid 10-digit phone number',
    realCall: 'Real Phone Call', realCallDesc: 'Aira calls your phone — no browser mic needed',
    naturalConvo: 'Natural Conversation', naturalConvoDesc: 'Speak naturally, Aira understands and responds',
    aiPowered: 'AI Powered', aiPoweredDesc: 'Powered by Retell AI for human-like interaction',
    hoursAgo: '{{count}}h ago',
  },
};

const hi = {
  brand: 'WITH_U',
  greeting: { supporting: 'हमेशा आपके साथ' },
  nav: { home: 'होम', mission: 'मिशन', features: 'फीचर्स', contact: 'संपर्क', getStarted: 'शुरू करें', login: 'साइन इन', companion: 'AI साथी', relief: 'त्वरित राहत', medications: 'स्मार्ट दवा', dashboard: 'डैशबोर्ड', settings: 'सेटिंग्स', logout: 'साइन आउट', moodsense: 'MoodSense साथी', gentleSearch: 'जेंटल सर्च', callAira: 'Aira को कॉल' },
  sidebar: { dashboard: 'डैशबोर्ड', features: 'फीचर्स', relief: 'त्वरित राहत', games: 'गेम ज़ोन', resources: 'संसाधन', gentlereach: 'जेंटलरीच', settings: 'सेटिंग्स', callAira: 'Aira को कॉल', sectionCompanion: 'साथी', sectionDaily: 'दैनिक', sectionActivities: 'गतिविधियां', sectionSupport: 'सहायता' },
  hero: { title: 'आप सबका ख़याल रखते हैं।', title2: 'अब हम आपके लिए हैं।', subtitle: 'एक शांत साथी जो आपकी थकान समझता है — बिना पूछे।', ctaPrimary: 'धीरे से शुरू करें', ctaGhost: 'हमारी कहानी' },
  mission: { title: 'जो बोझ कोई नहीं देखता', body: 'देखभाल एक अदृश्य काम है — लंबा, शांत, बिना रुके। WITH_U धीमे से सुनता है, आपकी लय समझता है, और जब बोझ बढ़ता है तो छोटी कोमलताएं देता है।', pillars: { invisible: { title: 'अदृश्य बोझ', body: 'जो दूसरे नहीं देखते — हम बिना पूछे महसूस करते हैं।' }, gentle: { title: 'बिना दख़ल', body: 'बेमतलब अलर्ट नहीं। शोर नहीं।' }, warm: { title: 'भावनात्मक समझ', body: 'मुलायम भाषा। दोस्त-सी टोन।' } } },
  features: { title: 'छोटी चीजें, धीरे से', items: { journal: { title: 'अदृश्य जर्नलिंग', body: 'एक वाक्य बोलिए या लिखिए। बस इतना।' }, stress: { title: 'तनाव की पहचान', body: 'दिनों के पैटर्न से समझते हैं।' }, nudges: { title: 'कोमल याद', body: '"थोड़ा रुकिए।" "एक गिलास पानी।"' }, resources: { title: 'शांत अभ्यास', body: 'दो मिनट की छोटी चीजें।' }, gentleReach: { title: 'GentleReach', body: 'जब बोझ बढ़ता है, किसी अपने तक एक कोमल संदेश।' }, privacy: { title: 'गोपनीयता पहले', body: 'आपकी बातें आपकी हैं। हमेशा।' } } },
  contact: { title: 'हमें लिखिए', name: 'आपका नाम', email: 'ईमेल', message: 'क्या कहना चाहेंगे', send: 'भेजें' },
  footer: { tagline: 'उनके लिए जो दूसरों को संभालते हैं।', copyright: '© 2026 WITH_U' },
  auth: { signupTitle: 'अपने लिए एक शांत जगह बनाएं', loginTitle: 'फिर से नमस्ते', name: 'आपका नाम', email: 'ईमेल', password: 'पासवर्ड', signup: 'खाता बनाएं', login: 'साइन इन', google: 'Google से जारी रखें', haveAccount: 'पहले से खाता है?', noAccount: 'नए हैं?', trustedContact: 'एक भरोसेमंद व्यक्ति जोड़ें', contactName: 'नाम', contactEmail: 'ईमेल', switchSignup: 'खाता बनाएं', switchLogin: 'साइन इन' },
  dashboard: { moodTitle: 'दिन कैसे रहे', speakTitle: 'क्या मन में है?', speakPlaceholder: 'एक वाक्य लिखिए या बोलिए।', send: 'साझा करें', speak: 'बोलकर कहिए', recording: 'सुन रहे हैं...', suggestions: 'एक छोटी कोमलता', resources: 'शांत अभ्यास', gentleReachOn: 'GentleReach चालू है', gentleReachOff: 'GentleReach बंद है', recent: 'हाल के पल', empty: 'अभी कुछ नहीं — जब चाहें तब साझा कीजिए।', stressLow: 'हल्का दिन', stressMid: 'थोड़ा भारी', stressHigh: 'बहुत कुछ है', goodMorning: 'सुप्रभात', goodAfternoon: 'नमस्ते', goodEvening: 'शुभ संध्या', hello: 'नमस्ते', welcomeMsg: 'WITH_U में आपका स्वागत है — आपके दैनिक स्वास्थ्य का शांत साथी।', talkToAira: 'Aira से बात करें', reliefDesc: 'जब तनाव ज़्यादा हो तो श्वास, ग्राउंडिंग या रीसेट टूल्स का उपयोग करें।' },
  settings: { title: 'सेटिंग्स', appearance: 'रूप', theme: 'थीम', language: 'भाषा', gentleReach: 'GentleReach', gentleReachBody: 'अगर तनाव बढ़ रहा हो, तो किसी भरोसेमंद को कोमल संदेश जाएगा।', contacts: 'भरोसेमंद लोग', addContact: 'जोड़ें', privacy: 'गोपनीयता', privacyMode: 'मेरी बातें डिवाइस प्रीव्यू में न दिखें', save: 'सहेजें', deleteAccount: 'खाता हटाएं' },
  common: { loading: 'एक पल...', save: 'सहेजें', cancel: 'रद्द', delete: 'हटाएं', confirm: 'पक्का', back: 'वापस' },
  erCompanion: { chat: 'चैट', placeholder: 'कुछ कहिए, या बस यहीं रुकिए...', takingYouTo: 'आपको ले जा रहे हैं', cancel: 'रद्द करें', withUIsHere: 'With_U यहाँ है...', hearingYou: 'आपको सुन रहे हैं', invisibleStress: 'अदृश्य तनाव', detectedEmotion: 'पहचानी गई भावना', currentState: 'वर्तमान स्थिति', suggestedForYou: 'आपके लिए सुझाव', trustedContacts: 'भरोसेमंद संपर्क', reachOutPrompt: 'क्या आप किसी भरोसेमंद व्यक्ति से संपर्क करना चाहेंगे?', noContacts: 'अभी कोई भरोसेमंद संपर्क नहीं', contactName: 'संपर्क का नाम:', phoneNumber: 'फ़ोन नंबर:' },
  dashCards: {
    companion: 'AI साथी', companionDesc: 'अपने व्यक्तिगत AI साथी के साथ बात करें और सुने जाएं।',
    medication: 'स्मार्ट दवा', medicationDesc: 'दवाएं ट्रैक करें, SMS रिमाइंडर पाएं, और अनुकूलित सुझाव।',
    relief: 'त्वरित राहत', reliefDesc: 'श्वास व्यायाम, ग्राउंडिंग अभ्यास, और शांत ध्वनियां।',
    moodsense: 'मूडसेंस साथी', moodsenseDesc: 'रियल-टाइम भावना पहचान और AI-संचालित कल्याण सहायता।',
    gentleSearch: 'जेंटल सर्च', gentleSearchDesc: 'सहायता संसाधन खोजें और किसी भरोसेमंद से संपर्क करें।',
    focusToday: 'आज आप किस पर ध्यान देना चाहेंगे?',
    currentStatus: 'वर्तमान स्थिति', recentActivity: 'हालिया गतिविधि',
    feelingOverwhelmed: 'अभिभूत महसूस कर रहे हैं?', overwhelmedTip: 'एक त्वरित ग्राउंडिंग सत्र से लाभ हो सकता है।',
    tryRelief: 'त्वरित राहत आज़माएं', completedSession: '10 मिनट का सत्र पूरा किया',
    breathingExercise: 'बॉक्स श्वास व्यायाम', ago: 'पहले', yesterday: 'कल',
  },
  mood: {
    title: 'मूडसेंस साथी', subtitle: 'रियल-टाइम भावना पहचान और AI-संचालित कल्याण सहायता',
    allowCamera: 'कैमरा अनुमति दें', allowCameraDesc: 'आपके मूड को समझने के लिए कैमरा अनुमति दें।',
    privacyNote: 'आपका कैमरा फ़ीड डिवाइस पर ही रहता है। कुछ भी रिकॉर्ड नहीं होता।',
    enableCamera: 'कैमरा चालू करें', loadingModels: 'AI मॉडल लोड हो रहे हैं…',
    cameraNotAvailable: 'कैमरा उपलब्ध नहीं', cameraRequired: 'मूड पहचान के लिए कैमरा अनुमति आवश्यक है।',
    tryAgain: 'पुनः प्रयास करें', liveFeed: 'लाइव फ़ीड', stop: 'बंद', noFace: 'चेहरा नहीं',
    stressLevel: 'तनाव स्तर', emotionTimeline: 'भावना समयरेखा',
    aiCompanion: 'AI साथी', suggestions: 'सुझाव',
    breathingExercise: 'श्वास व्यायाम', breathingTechnique: '4-7-8 तकनीक • शुरू करने के लिए टैप करें',
    breathing478: '4-7-8 श्वास', inhale: 'साँस लें', hold: 'रोकें', exhale: 'छोड़ें',
    followCircle: 'फैलते हुए वृत्त का अनुसरण करें', cycle: 'चक्र',
    calm: 'शांत', moderate: 'मध्यम', highStress: 'उच्च तनाव',
  },
  gentle: {
    title: 'जेंटल सर्च', subtitle: 'सहायता संसाधन खोजें और भरोसेमंद संपर्कों तक पहुंचें।',
    searchPlaceholder: 'संसाधन खोजें...', callAI: 'AI सहायता कॉल', callContact: 'आपातकालीन संपर्क कॉल',
    supportResources: 'सहायता संसाधन', trustedContacts: 'भरोसेमंद संपर्क',
  },
  relief: {
    title: 'त्वरित राहत', subtitle: 'अभिभूत क्षणों के लिए छोटे उपकरण।',
    tabExercises: 'व्यायाम', tabCondition: 'स्थिति अनुसार',
    breathing: 'श्वास रीसेट', breathingDesc: 'एक मिनट का श्वास रीसेट।',
    audio: 'शांत ऑडियो', audioDesc: 'बारिश, लहरें, या पियानो।',
    reset: 'रीसेट विराम', resetDesc: 'शरीर को शांत करने के सरल संकेत।',
    gratitude: 'कृतज्ञता', gratitudeDesc: 'एक छोटा पल जो अच्छा लगा।',
    checkin: 'कोमल जांच', checkinDesc: 'तीन कोमल प्रश्न।',
    quiet: 'शांत मोड', quietDesc: 'गति कम करें और UI को नरम करें।',
    breathingTitle: 'श्वास व्यायाम', breathingIn: 'धीरे से साँस लें...', breathingHold: 'कोमलता से रोकें...', breathingOut: 'धीरे से छोड़ें...',
    audioTitle: 'शांत ध्वनियां', audioSubtitle: 'चलाने के लिए टैप करें', playing: 'चल रहा है',
    soundRain: 'हल्की बारिश', soundWaves: 'समुद्री लहरें', soundPiano: 'सौम्य पियानो',
    resetTitle: 'रीसेट विराम', resetSubtitle: 'आपको वापस लाने के शारीरिक संकेत',
    gratitudeTitle: 'कृतज्ञता का पल', gratitudePlaceholder: 'मैं आभारी हूँ...', gratitudeEmpty: 'आपके कृतज्ञता नोट्स यहां दिखेंगे।',
    checkinTitle: 'कोमल जांच', checkinSubmit: 'जमा करें',
    quietTitle: 'शांत मोड', quietEnable: 'शांत मोड चालू करें', quietDisable: 'शांत मोड बंद करें',
  },
  support: {
    title: 'सहायता उपलब्ध है', prompt: 'क्या आप किसी भरोसेमंद से संपर्क करना चाहेंगे?',
    noContacts: 'अभी कोई भरोसेमंद संपर्क नहीं', call: 'कॉल', addContact: 'भरोसेमंद संपर्क जोड़ें',
    namePlaceholder: 'नाम', phonePlaceholder: 'फ़ोन', add: 'संपर्क जोड़ें',
    ngos: 'सहायता विकल्प', reachOut: 'सहायता तक पहुंचें',
  },
  meds: {
    title: 'स्मार्ट दवा', subtitle: 'कोमल अनुस्मारक जो आपके साथ चलते हैं।',
    addTitle: 'दवा जोड़ें', namePlaceholder: 'दवा का नाम',
    dosagePlaceholder: 'खुराक (जैसे 500 mg)', add: 'जोड़ें',
    scheduleTitle: 'दैनिक अनुसूची', noSchedule: 'अभी कोई अनुसूची नहीं',
    taken: 'ली गई', remind: 'याद दिलाएं',
  },
  callAira: {
    title: 'Aira से बात करें', subtitle: 'Aira AI का उपयोग करके आपके फ़ोन पर कॉल करेगी और स्वाभाविक रूप से बात करेगी',
    readyToCall: 'कॉल के लिए तैयार', callingPhone: 'आपके फ़ोन पर कॉल कर रहे हैं...', pickUp: 'जब फ़ोन बजे तो उठाएं',
    callInitiated: 'कॉल शुरू हो गई!', phoneRinging: 'आपका फ़ोन बज रहा है। Aira से बात करने के लिए उठाएं।',
    callFailed: 'कॉल विफल', callNow: 'अभी Aira को कॉल करें', cancel: 'रद्द करें', done: 'पूर्ण',
    phoneLabel: 'आपका फ़ोन नंबर', phonePlaceholder: 'फ़ोन नंबर दर्ज करें',
    invalidPhone: 'एक वैध 10-अंक का फ़ोन नंबर दर्ज करें',
    realCall: 'असली फ़ोन कॉल', realCallDesc: 'Aira आपके फ़ोन पर कॉल करती है — ब्राउज़र माइक की ज़रूरत नहीं',
    naturalConvo: 'स्वाभाविक बातचीत', naturalConvoDesc: 'स्वाभाविक रूप से बोलें, Aira समझती है और जवाब देती है',
    aiPowered: 'AI संचालित', aiPoweredDesc: 'मानव जैसी बातचीत के लिए Retell AI द्वारा संचालित',
  },
};

/** Deep-merge overrides into en — handles nested objects like mission.pillars, features.items */
const deepMerge = (base, override) => {
  if (!override) return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key]) &&
      typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
};

const makeLang = (overrides) => deepMerge(en, overrides);


const ta = makeLang(translations.ta || {});
const te = makeLang(translations.te || {});
const kn = makeLang(translations.kn || {});
const ml = makeLang(translations.ml || {});
const bn = makeLang(translations.bn || {});
const mr = makeLang(translations.mr || {});
const gu = makeLang(translations.gu || {});
const pa = makeLang(translations.pa || {});
const ur = makeLang(translations.ur || {});
const or2 = makeLang({});
const as2 = makeLang({});
const ja = makeLang({});
const ko = makeLang({});
const zh = makeLang({});

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      ml: { translation: ml },
      bn: { translation: bn },
      mr: { translation: mr },
      gu: { translation: gu },
      pa: { translation: pa },
      ur: { translation: ur },
      or: { translation: or2 },
      as: { translation: as2 },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
    },
    lng: localStorage.getItem('with_u_lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
