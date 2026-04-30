import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = {
  brand: 'WITH_U',
  greeting: { supporting: 'Supporting you, always' },
  nav: { home: 'Home', mission: 'Mission', features: 'Features', contact: 'Contact', getStarted: 'Get Started', login: 'Sign in', companion: 'AI Companion', relief: 'Quick Relief', medications: 'Smart Medication', dashboard: 'Dashboard', settings: 'Settings', logout: 'Sign out', profile: 'Profile', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search' },
  sidebar: { dashboard: 'Dashboard', features: 'Features', relief: 'Quick Relief', games: 'Game Zone', resources: 'Resources', gentlereach: 'GentleReach', companion: 'AI Companion', medications: 'Smart Medication', settings: 'Settings', insights: 'Stress Insights', routine: 'Daily Routine', music: 'Calming Music', support: 'Support & Calls', sectionCompanion: 'Companion', sectionDaily: 'Daily', sectionActivities: 'Activities', sectionSupport: 'Support', moodsense: 'MoodSense Companion', gentleSearch: 'Gentle Search' },
  hero: { title: 'You take care of everyone.', title2: "We're here for you.", subtitle: 'A quiet companion that understands your stress â€” without asking.', ctaPrimary: 'Begin gently', ctaGhost: 'Read our story' },
  mission: { title: 'The weight nobody sees', body: "Caregiving is invisible work â€” long, quiet, and rarely paused. WITH_U listens softly, learns your rhythm, and offers small kindnesses when the load grows heavy. No labels. No clinical questions. Just a steady presence in the background of your day.", pillars: { invisible: { title: 'Invisible burden', body: 'We notice what others miss â€” without asking you to explain.' }, gentle: { title: 'Non-intrusive', body: "No nudges you didn't ask for. No alerts that stress you more." }, warm: { title: 'Emotional intelligence', body: 'Soft language. Human tone. Designed to feel like a friend.' } } },
  features: { title: 'Small things, gently done', subtitle: 'Everything is designed to feel invisible yet supportive', items: { journal: { title: 'Invisible journaling', body: "Speak or type a sentence. We listen. That's all you need to do." }, stress: { title: 'Stress detection', body: 'We notice patterns over days, not snapshots â€” and never label you.' }, nudges: { title: 'Gentle nudges', body: '"Maybe a small break." "A glass of water." Things you\'d say to a friend.' }, resources: { title: 'Quiet resources', body: 'Two-minute exercises and small reset rituals. Nothing heavy.' }, gentleReach: { title: 'GentleReach', body: 'A trusted person gets a soft note when life gets heavy. You stay in control.' }, privacy: { title: 'Privacy first', body: 'Your words stay yours. Encrypted. Never sold. Always erasable.' } } },
  contact: { title: 'A note to us', subtitle: 'We read every message. No auto-replies.', name: 'Your name', email: 'Email', message: "What you'd like to say", send: 'Send softly' },
  footer: { tagline: 'A quiet companion for those who carry others.', copyright: 'Â© 2026 WITH_U. Made with care.', product: 'Product', company: 'Company', legal: 'Legal', about: 'About', careers: 'Careers', privacyPolicy: 'Privacy Policy', terms: 'Terms of Use', cookies: 'Cookie Policy', madeWith: 'Made with', forCarriers: 'for those who carry others' },
  auth: { signupTitle: 'Make a quiet space for yourself', loginTitle: 'Welcome back', name: 'Your name', email: 'Email', password: 'Password', signup: 'Create account', login: 'Sign in', google: 'Continue with Google', haveAccount: 'Already have an account?', noAccount: 'New here?', trustedContact: 'Add a trusted contact (optional)', contactName: 'Contact name', contactEmail: 'Contact email', switchSignup: 'Sign up', switchLogin: 'Sign in', or: 'or', welcomeBack: 'Welcome back', welcomeToWithU: 'Welcome to WITH_U', checkEmail: 'Check your email to confirm your account.' },
  dashboard: { moodTitle: 'How the days have felt', speakTitle: "What's on your mind?", speakPlaceholder: "Type a sentence, or just speak. There's no right answer.", send: 'Share gently', speak: 'Speak instead', recording: 'Listening...', suggestions: 'A small kindness', resources: 'Quiet practices', gentleReachOn: 'GentleReach is on', gentleReachOff: 'GentleReach is off', recent: 'Recent moments', empty: "No moments yet â€” share one when you're ready.", stressLow: 'A lighter day', stressMid: 'A bit heavy', stressHigh: 'Carrying a lot', goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening', hello: 'Hello', welcomeMsg: 'Welcome to WITH_U â€” your quiet companion for everyday wellbeing.', stress: 'Stress', today: 'today', open: 'Open', noMedScheduled: 'No medication scheduled', addMedNote: 'Add one to enable reminders across the app.', add: 'Add', nextDose: 'Next dose', markTaken: 'Mark taken', remindNow: 'Remind now', more: 'more', alwaysAvailable: 'Always available', exercises: 'exercises', talkToAira: 'Talk to Aira', companionDesc: 'Your quiet companion. Chat, listen, and feel heard.', reliefDesc: 'Use breathing, grounding, or reset tools when stress feels high.', medsDesc: 'Manage reminders, refills, and supportive routines in one place.', gentleReachDesc: 'A soft, automatic note to someone you trust when stress climbs.', addFirst: 'Add your first', active: 'active', on: 'On', off: 'Off' },
  settings: { title: 'Settings', appearance: 'Appearance', theme: 'Theme', language: 'Language', gentleReach: 'GentleReach', gentleReachBody: "A trusted person gets a soft note if your stress trend worsens over several days. You stay in control.", contacts: 'Trusted contacts', addContact: 'Add contact', privacy: 'Privacy', privacyMode: 'Hide my entries from device previews', save: 'Save', deleteAccount: 'Delete account', voiceResponses: 'Voice responses', nudgeFrequency: 'Nudge frequency', enableGentleReach: 'Enable GentleReach', dangerZone: 'Danger Zone', dangerBody: 'This will permanently delete your account, all logs, sentiment history, and contacts. This cannot be undone.', confirmDeletePrompt: 'Are you sure? Click to confirm.', yesDelete: 'Yes, delete everything', deleting: 'Deleting...', system: 'System', light: 'Light', dark: 'Dark', low: 'Low', medium: 'Medium', high: 'High', relationPlaceholder: 'Relation (e.g. Sister, Friend)', noContacts: 'No trusted contacts yet. Add one above.', primary: 'primary' },
  common: { loading: 'A moment...', save: 'Save', cancel: 'Cancel', delete: 'Remove', confirm: 'Confirm', back: 'Back', or: 'or' },
  landing: { gentlyListening: 'Gently listening', heroCardTime: 'a quiet moment ago', heroCardMsg: "You've been carrying a lot this week. Maybe a small pause â€” even five minutes â€” would feel kind today.", heroChip1: 'ðŸ« a slow breath', heroChip2: 'ðŸ’§ water', heroChip3: 'ðŸŒ¿ a short walk', listeningSoftly: 'Listening softly', stressTrend: 'Stress trend: improving', coreTitle: 'Explore the core Aira experience', coreSubtitle: 'Jump straight into the companion, relief tools, or medicine tracker.', companionTitle: 'Aira Companion', companionDesc: 'Talk, reflect, and receive calm guidance tailored to your moment.', reliefTitle: 'Quick Relief', reliefDesc: 'Use fast breathing, grounding, or reset tools when stress feels high.', medsTitle: 'Smart Medication', medsDesc: 'Manage reminders, refills, and supportive routines in one place.', open: 'Open', trusted: 'Trusted by caregivers across India', private: '100% private', noClinical: 'No clinical labels', howTitle: 'How it works', step1Title: 'Share a moment', step1Body: "Type a sentence or speak aloud. No structure needed â€” just what's on your mind.", step2Title: 'We listen gently', step2Body: 'Our AI notices patterns across days. We never judge or label â€” just quietly understand.', step3Title: 'Receive soft support', step3Body: 'A kind word. A micro-suggestion. A glass of water reminder. Small things that matter.', step4Title: 'GentleReach (if you choose)', step4Body: 'If stress lingers, a trusted person gets a soft note. You stay in complete control.', testimonialTitle: 'Quiet words from caregivers', ctaTitle: "You don't have to carry it alone", ctaBody: 'Begin gently. No commitments. No clinical forms. Just a quiet space that understands.', startJourney: 'Start your journey', freeToStart: 'Free to start', noCreditCard: 'No credit card', completePrivacy: 'Complete privacy', motherCaregiver: 'Mother & caregiver', sonCaring: 'Son caring for parents', familySupport: 'Family support', quote1: "I didn't realize how much I was carrying until WITH_U gently showed me.", quote2: "The fact that it never asks 'how are you' â€” and still knows â€” is what makes it different.", quote3: 'GentleReach saved my sister from burning out quietly. Just a soft note was enough.', yourCompanion: 'Your Companion' },
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
    breathingCycle: 'Cycle {{count}} Â· 4-7-8 breathing',
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
    enableCamera: 'Enable Camera', loadingModels: 'Loading AI models & starting cameraâ€¦',
    cameraNotAvailable: 'Camera Not Available', cameraRequired: 'Camera access is required for mood detection. Please allow camera permissions.',
    tryAgain: 'Try Again', liveFeed: 'Live Feed', stop: 'Stop', noFace: 'No face',
    stressLevel: 'Stress Level', emotionTimeline: 'Emotion Timeline',
    aiCompanion: 'AI Companion', suggestions: 'Suggestions',
    breathingExercise: 'Breathing Exercise', breathingTechnique: '4-7-8 technique â€¢ Tap to start',
    breathing478: '4-7-8 Breathing', inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale',
    followCircle: 'Follow the expanding circle', cycle: 'Cycle',
    calm: 'Calm', moderate: 'Moderate', highStress: 'High Stress',
  },
  gentle: {
    title: 'Gentle Search', subtitle: 'Find support resources and reach out to trusted contacts.',
    searchPlaceholder: 'Search resources...', callAI: 'Call AI Support', callContact: 'Call Emergency Contact',
    supportResources: 'Support Resources', trustedContacts: 'Trusted Contacts',
  },
};

const hi = {
  brand: 'WITH_U',
  nav: { home: 'à¤¹à¥‹à¤®', mission: 'à¤®à¤¿à¤¶à¤¨', features: 'à¤«à¤¼à¥€à¤šà¤°à¥à¤¸', contact: 'à¤¸à¤‚à¤ªà¤°à¥à¤•', getStarted: 'à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚', login: 'à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨', dashboard: 'à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡', settings: 'à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸', logout: 'à¤¸à¤¾à¤‡à¤¨ à¤†à¤‰à¤Ÿ' },
  sidebar: { dashboard: 'à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡', features: 'à¤«à¤¼à¥€à¤šà¤°à¥à¤¸', relief: 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤°à¤¾à¤¹à¤¤', games: 'à¤—à¥‡à¤® à¤œà¤¼à¥‹à¤¨', resources: 'à¤¸à¤‚à¤¸à¤¾à¤§à¤¨', gentlereach: 'à¤œà¥‡à¤‚à¤Ÿà¤²à¤°à¥€à¤š', settings: 'à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸' },
  hero: { title: 'à¤†à¤ª à¤¸à¤¬à¤•à¤¾ à¤–à¤¼à¤¯à¤¾à¤² à¤°à¤–à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤', title2: 'à¤…à¤¬ à¤¹à¤® à¤†à¤ªà¤•à¥‡ à¤²à¤¿à¤ à¤¹à¥ˆà¤‚à¥¤', subtitle: 'à¤à¤• à¤¶à¤¾à¤‚à¤¤ à¤¸à¤¾à¤¥à¥€ à¤œà¥‹ à¤†à¤ªà¤•à¥€ à¤¥à¤•à¤¾à¤¨ à¤¸à¤®à¤à¤¤à¤¾ à¤¹à¥ˆ â€” à¤¬à¤¿à¤¨à¤¾ à¤ªà¥‚à¤›à¥‡à¥¤', ctaPrimary: 'à¤§à¥€à¤°à¥‡ à¤¸à¥‡ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚', ctaGhost: 'à¤¹à¤®à¤¾à¤°à¥€ à¤•à¤¹à¤¾à¤¨à¥€' },
  mission: { title: 'à¤œà¥‹ à¤¬à¥‹à¤ à¤•à¥‹à¤ˆ à¤¨à¤¹à¥€à¤‚ à¤¦à¥‡à¤–à¤¤à¤¾', body: 'à¤¦à¥‡à¤–à¤­à¤¾à¤² à¤à¤• à¤…à¤¦à¥ƒà¤¶à¥à¤¯ à¤•à¤¾à¤® à¤¹à¥ˆ â€” à¤²à¤‚à¤¬à¤¾, à¤¶à¤¾à¤‚à¤¤, à¤¬à¤¿à¤¨à¤¾ à¤°à¥à¤•à¥‡à¥¤ WITH_U à¤§à¥€à¤®à¥‡ à¤¸à¥‡ à¤¸à¥à¤¨à¤¤à¤¾ à¤¹à¥ˆ, à¤†à¤ªà¤•à¥€ à¤²à¤¯ à¤¸à¤®à¤à¤¤à¤¾ à¤¹à¥ˆ, à¤”à¤° à¤œà¤¬ à¤¬à¥‹à¤ à¤¬à¤¢à¤¼à¤¤à¤¾ à¤¹à¥ˆ à¤¤à¥‹ à¤›à¥‹à¤Ÿà¥€ à¤•à¥‹à¤®à¤²à¤¤à¤¾à¤à¤ à¤¦à¥‡à¤¤à¤¾ à¤¹à¥ˆà¥¤', pillars: { invisible: { title: 'à¤…à¤¦à¥ƒà¤¶à¥à¤¯ à¤¬à¥‹à¤', body: 'à¤œà¥‹ à¤¦à¥‚à¤¸à¤°à¥‡ à¤¨à¤¹à¥€à¤‚ à¤¦à¥‡à¤–à¤¤à¥‡ â€” à¤¹à¤® à¤¬à¤¿à¤¨à¤¾ à¤ªà¥‚à¤›à¥‡ à¤®à¤¹à¤¸à¥‚à¤¸ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤' }, gentle: { title: 'à¤¬à¤¿à¤¨à¤¾ à¤¦à¤–à¤¼à¤²', body: 'à¤¬à¥‡à¤®à¤¤à¤²à¤¬ à¤…à¤²à¤°à¥à¤Ÿ à¤¨à¤¹à¥€à¤‚à¥¤ à¤¶à¥‹à¤° à¤¨à¤¹à¥€à¤‚à¥¤' }, warm: { title: 'à¤­à¤¾à¤µà¤¨à¤¾à¤¤à¥à¤®à¤• à¤¸à¤®à¤', body: 'à¤®à¥à¤²à¤¾à¤¯à¤® à¤­à¤¾à¤·à¤¾à¥¤ à¤¦à¥‹à¤¸à¥à¤¤-à¤¸à¥€ à¤Ÿà¥‹à¤¨à¥¤' } } },
  features: { title: 'à¤›à¥‹à¤Ÿà¥€ à¤šà¥€à¤œà¤¼à¥‡à¤‚, à¤§à¥€à¤°à¥‡ à¤¸à¥‡', items: { journal: { title: 'à¤…à¤¦à¥ƒà¤¶à¥à¤¯ à¤œà¤°à¥à¤¨à¤²à¤¿à¤‚à¤—', body: 'à¤à¤• à¤µà¤¾à¤•à¥à¤¯ à¤¬à¥‹à¤²à¤¿à¤ à¤¯à¤¾ à¤²à¤¿à¤–à¤¿à¤à¥¤ à¤¬à¤¸ à¤‡à¤¤à¤¨à¤¾à¥¤' }, stress: { title: 'à¤¤à¤¨à¤¾à¤µ à¤•à¥€ à¤ªà¤¹à¤šà¤¾à¤¨', body: 'à¤¦à¤¿à¤¨à¥‹à¤‚ à¤•à¥‡ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¸à¥‡ à¤¸à¤®à¤à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤' }, nudges: { title: 'à¤•à¥‹à¤®à¤² à¤¯à¤¾à¤¦', body: '"à¤¥à¥‹à¤¡à¤¼à¤¾ à¤°à¥à¤•à¤¿à¤à¥¤" "à¤à¤• à¤—à¤¿à¤²à¤¾à¤¸ à¤ªà¤¾à¤¨à¥€à¥¤"' }, resources: { title: 'à¤¶à¤¾à¤‚à¤¤ à¤…à¤­à¥à¤¯à¤¾à¤¸', body: 'à¤¦à¥‹ à¤®à¤¿à¤¨à¤Ÿ à¤•à¥€ à¤›à¥‹à¤Ÿà¥€ à¤šà¥€à¤œà¤¼à¥‡à¤‚à¥¤' }, gentleReach: { title: 'GentleReach', body: 'à¤œà¤¬ à¤¬à¥‹à¤ à¤¬à¤¢à¤¼à¤¤à¤¾ à¤¹à¥ˆ, à¤•à¤¿à¤¸à¥€ à¤…à¤ªà¤¨à¥‡ à¤¤à¤• à¤à¤• à¤•à¥‹à¤®à¤² à¤¸à¤‚à¤¦à¥‡à¤¶à¥¤' }, privacy: { title: 'à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾ à¤ªà¤¹à¤²à¥‡', body: 'à¤†à¤ªà¤•à¥€ à¤¬à¤¾à¤¤à¥‡à¤‚ à¤†à¤ªà¤•à¥€ à¤¹à¥ˆà¤‚à¥¤ à¤¹à¤®à¥‡à¤¶à¤¾à¥¤' } } },
  contact: { title: 'à¤¹à¤®à¥‡à¤‚ à¤²à¤¿à¤–à¤¿à¤', name: 'à¤†à¤ªà¤•à¤¾ à¤¨à¤¾à¤®', email: 'à¤ˆà¤®à¥‡à¤²', message: 'à¤•à¥à¤¯à¤¾ à¤•à¤¹à¤¨à¤¾ à¤šà¤¾à¤¹à¥‡à¤‚à¤—à¥‡', send: 'à¤­à¥‡à¤œà¥‡à¤‚' },
  footer: { tagline: 'à¤‰à¤¨à¤•à¥‡ à¤²à¤¿à¤ à¤œà¥‹ à¤¦à¥‚à¤¸à¤°à¥‹à¤‚ à¤•à¥‹ à¤¸à¤à¤­à¤¾à¤²à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤', copyright: 'Â© 2026 WITH_U' },
  auth: { signupTitle: 'à¤…à¤ªà¤¨à¥‡ à¤²à¤¿à¤ à¤à¤• à¤¶à¤¾à¤‚à¤¤ à¤œà¤—à¤¹ à¤¬à¤¨à¤¾à¤‡à¤', loginTitle: 'à¤«à¤¿à¤° à¤¸à¥‡ à¤¨à¤®à¤¸à¥à¤¤à¥‡', name: 'à¤†à¤ªà¤•à¤¾ à¤¨à¤¾à¤®', email: 'à¤ˆà¤®à¥‡à¤²', password: 'à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡', signup: 'à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤‡à¤', login: 'à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨', google: 'Google à¤¸à¥‡ à¤œà¤¾à¤°à¥€ à¤°à¤–à¥‡à¤‚', haveAccount: 'à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤–à¤¾à¤¤à¤¾ à¤¹à¥ˆ?', noAccount: 'à¤¨à¤ à¤¹à¥ˆà¤‚?', trustedContact: 'à¤à¤• à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚', contactName: 'à¤¨à¤¾à¤®', contactEmail: 'à¤ˆà¤®à¥‡à¤²', switchSignup: 'à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤‡à¤', switchLogin: 'à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨' },
  dashboard: { moodTitle: 'à¤¦à¤¿à¤¨ à¤•à¥ˆà¤¸à¥‡ à¤°à¤¹à¥‡', speakTitle: 'à¤•à¥à¤¯à¤¾ à¤®à¤¨ à¤®à¥‡à¤‚ à¤¹à¥ˆ?', speakPlaceholder: 'à¤à¤• à¤µà¤¾à¤•à¥à¤¯ à¤²à¤¿à¤–à¤¿à¤ à¤¯à¤¾ à¤¬à¥‹à¤²à¤¿à¤à¥¤', send: 'à¤¸à¤¾à¤à¤¾ à¤•à¤°à¥‡à¤‚', speak: 'à¤¬à¥‹à¤²à¤•à¤° à¤•à¤¹à¤¿à¤', recording: 'à¤¸à¥à¤¨ à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚...', suggestions: 'à¤à¤• à¤›à¥‹à¤Ÿà¥€ à¤•à¥‹à¤®à¤²à¤¤à¤¾', resources: 'à¤¶à¤¾à¤‚à¤¤ à¤…à¤­à¥à¤¯à¤¾à¤¸', gentleReachOn: 'GentleReach à¤šà¤¾à¤²à¥‚ à¤¹à¥ˆ', gentleReachOff: 'GentleReach à¤¬à¤‚à¤¦ à¤¹à¥ˆ', recent: 'à¤¹à¤¾à¤² à¤•à¥‡ à¤ªà¤²', empty: 'à¤…à¤­à¥€ à¤•à¥à¤› à¤¨à¤¹à¥€à¤‚ â€” à¤œà¤¬ à¤šà¤¾à¤¹à¥‡à¤‚ à¤¤à¤¬ à¤¸à¤¾à¤à¤¾ à¤•à¥€à¤œà¤¿à¤à¥¤', stressLow: 'à¤¹à¤²à¥à¤•à¤¾ à¤¦à¤¿à¤¨', stressMid: 'à¤¥à¥‹à¤¡à¤¼à¤¾ à¤­à¤¾à¤°à¥€', stressHigh: 'à¤¬à¤¹à¥à¤¤ à¤•à¥à¤› à¤¹à¥ˆ' },
  settings: { title: 'à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸', appearance: 'à¤°à¥‚à¤ª', theme: 'à¤¥à¥€à¤®', language: 'à¤­à¤¾à¤·à¤¾', gentleReach: 'GentleReach', gentleReachBody: 'à¤…à¤—à¤° à¤¤à¤¨à¤¾à¤µ à¤¬à¤¢à¤¼ à¤°à¤¹à¤¾ à¤¹à¥‹, à¤¤à¥‹ à¤•à¤¿à¤¸à¥€ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤•à¥‹ à¤•à¥‹à¤®à¤² à¤¸à¤‚à¤¦à¥‡à¤¶ à¤œà¤¾à¤à¤—à¤¾à¥¤', contacts: 'à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤²à¥‹à¤—', addContact: 'à¤œà¥‹à¤¡à¤¼à¥‡à¤‚', privacy: 'à¤—à¥‹à¤ªà¤¨à¥€à¤¯à¤¤à¤¾', privacyMode: 'à¤®à¥‡à¤°à¥€ à¤¬à¤¾à¤¤à¥‡à¤‚ à¤¡à¤¿à¤µà¤¾à¤‡à¤¸ à¤ªà¥à¤°à¥€à¤µà¥à¤¯à¥‚ à¤®à¥‡à¤‚ à¤¨ à¤¦à¤¿à¤–à¥‡à¤‚', save: 'à¤¸à¤¹à¥‡à¤œà¥‡à¤‚', deleteAccount: 'à¤–à¤¾à¤¤à¤¾ à¤¹à¤Ÿà¤¾à¤à¤' },
  common: { loading: 'à¤à¤• à¤ªà¤²...', save: 'à¤¸à¤¹à¥‡à¤œà¥‡à¤‚', cancel: 'à¤°à¤¦à¥à¤¦', delete: 'à¤¹à¤Ÿà¤¾à¤à¤', confirm: 'à¤ªà¤•à¥à¤•à¤¾', back: 'à¤µà¤¾à¤ªà¤¸' },
  dashCards: {
    companion: 'AI à¤¸à¤¾à¤¥à¥€', companionDesc: 'à¤…à¤ªà¤¨à¥‡ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ AI à¤¸à¤¾à¤¥à¥€ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¬à¤¾à¤¤ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤¸à¥à¤¨à¥‡ à¤œà¤¾à¤à¤à¥¤',
    medication: 'à¤¸à¥à¤®à¤¾à¤°à¥à¤Ÿ à¤¦à¤µà¤¾', medicationDesc: 'à¤¦à¤µà¤¾à¤à¤ à¤Ÿà¥à¤°à¥ˆà¤• à¤•à¤°à¥‡à¤‚, SMS à¤°à¤¿à¤®à¤¾à¤‡à¤‚à¤¡à¤° à¤ªà¤¾à¤à¤, à¤”à¤° à¤…à¤¨à¥à¤•à¥‚à¤²à¤¿à¤¤ à¤¸à¥à¤à¤¾à¤µà¥¤',
    relief: 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤°à¤¾à¤¹à¤¤', reliefDesc: 'à¤¶à¥à¤µà¤¾à¤¸ à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®, à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡à¤¿à¤‚à¤— à¤…à¤­à¥à¤¯à¤¾à¤¸, à¤”à¤° à¤¶à¤¾à¤‚à¤¤ à¤§à¥à¤µà¤¨à¤¿à¤¯à¤¾à¤à¥¤',
    moodsense: 'à¤®à¥‚à¤¡à¤¸à¥‡à¤‚à¤¸ à¤¸à¤¾à¤¥à¥€', moodsenseDesc: 'à¤°à¤¿à¤¯à¤²-à¤Ÿà¤¾à¤‡à¤® à¤­à¤¾à¤µà¤¨à¤¾ à¤ªà¤¹à¤šà¤¾à¤¨ à¤”à¤° AI-à¤¸à¤‚à¤šà¤¾à¤²à¤¿à¤¤ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾à¥¤',
    gentleSearch: 'à¤œà¥‡à¤‚à¤Ÿà¤² à¤¸à¤°à¥à¤š', gentleSearchDesc: 'à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤¸à¤‚à¤¸à¤¾à¤§à¤¨ à¤–à¥‹à¤œà¥‡à¤‚ à¤”à¤° à¤•à¤¿à¤¸à¥€ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤',
    focusToday: 'à¤†à¤œ à¤†à¤ª à¤•à¤¿à¤¸ à¤ªà¤° à¤§à¥à¤¯à¤¾à¤¨ à¤¦à¥‡à¤¨à¤¾ à¤šà¤¾à¤¹à¥‡à¤‚à¤—à¥‡?',
    currentStatus: 'à¤µà¤°à¥à¤¤à¤®à¤¾à¤¨ à¤¸à¥à¤¥à¤¿à¤¤à¤¿', recentActivity: 'à¤¹à¤¾à¤²à¤¿à¤¯à¤¾ à¤—à¤¤à¤¿à¤µà¤¿à¤§à¤¿',
    feelingOverwhelmed: 'à¤…à¤­à¤¿à¤­à¥‚à¤¤ à¤®à¤¹à¤¸à¥‚à¤¸ à¤•à¤° à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚?', overwhelmedTip: 'à¤à¤• à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡à¤¿à¤‚à¤— à¤¸à¤¤à¥à¤° à¤¸à¥‡ à¤²à¤¾à¤­ à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤',
    tryRelief: 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤°à¤¾à¤¹à¤¤ à¤†à¤œà¤¼à¤®à¤¾à¤à¤', completedSession: '10 à¤®à¤¿à¤¨à¤Ÿ à¤•à¤¾ à¤¸à¤¤à¥à¤° à¤ªà¥‚à¤°à¤¾ à¤•à¤¿à¤¯à¤¾',
    breathingExercise: 'à¤¬à¥‰à¤•à¥à¤¸ à¤¶à¥à¤µà¤¾à¤¸ à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®', ago: 'à¤ªà¤¹à¤²à¥‡', yesterday: 'à¤•à¤²',
  },
  mood: {
    title: 'à¤®à¥‚à¤¡à¤¸à¥‡à¤‚à¤¸ à¤¸à¤¾à¤¥à¥€', subtitle: 'à¤°à¤¿à¤¯à¤²-à¤Ÿà¤¾à¤‡à¤® à¤­à¤¾à¤µà¤¨à¤¾ à¤ªà¤¹à¤šà¤¾à¤¨ à¤”à¤° AI-à¤¸à¤‚à¤šà¤¾à¤²à¤¿à¤¤ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾',
    allowCamera: 'à¤•à¥ˆà¤®à¤°à¤¾ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤¦à¥‡à¤‚', allowCameraDesc: 'à¤†à¤ªà¤•à¥‡ à¤®à¥‚à¤¡ à¤•à¥‹ à¤¸à¤®à¤à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥ˆà¤®à¤°à¤¾ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤¦à¥‡à¤‚à¥¤',
    privacyNote: 'à¤†à¤ªà¤•à¤¾ à¤•à¥ˆà¤®à¤°à¤¾ à¤«à¤¼à¥€à¤¡ à¤¡à¤¿à¤µà¤¾à¤‡à¤¸ à¤ªà¤° à¤¹à¥€ à¤°à¤¹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤•à¥à¤› à¤­à¥€ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹à¤¤à¤¾à¥¤',
    enableCamera: 'à¤•à¥ˆà¤®à¤°à¤¾ à¤šà¤¾à¤²à¥‚ à¤•à¤°à¥‡à¤‚', loadingModels: 'AI à¤®à¥‰à¤¡à¤² à¤²à¥‹à¤¡ à¤¹à¥‹ à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚â€¦',
    cameraNotAvailable: 'à¤•à¥ˆà¤®à¤°à¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚', cameraRequired: 'à¤®à¥‚à¤¡ à¤ªà¤¹à¤šà¤¾à¤¨ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥ˆà¤®à¤°à¤¾ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
    tryAgain: 'à¤ªà¥à¤¨à¤ƒ à¤ªà¥à¤°à¤¯à¤¾à¤¸', liveFeed: 'à¤²à¤¾à¤‡à¤µ à¤«à¤¼à¥€à¤¡', stop: 'à¤¬à¤‚à¤¦', noFace: 'à¤šà¥‡à¤¹à¤°à¤¾ à¤¨à¤¹à¥€à¤‚',
    stressLevel: 'à¤¤à¤¨à¤¾à¤µ à¤¸à¥à¤¤à¤°', emotionTimeline: 'à¤­à¤¾à¤µà¤¨à¤¾ à¤¸à¤®à¤¯à¤°à¥‡à¤–à¤¾',
    aiCompanion: 'AI à¤¸à¤¾à¤¥à¥€', suggestions: 'à¤¸à¥à¤à¤¾à¤µ',
    breathingExercise: 'à¤¶à¥à¤µà¤¾à¤¸ à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®', breathingTechnique: '4-7-8 à¤¤à¤•à¤¨à¥€à¤• â€¢ à¤¶à¥à¤°à¥‚ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤Ÿà¥ˆà¤ª à¤•à¤°à¥‡à¤‚',
    breathing478: '4-7-8 à¤¶à¥à¤µà¤¾à¤¸', inhale: 'à¤¸à¤¾à¤à¤¸ à¤²à¥‡à¤‚', hold: 'à¤°à¥‹à¤•à¥‡à¤‚', exhale: 'à¤›à¥‹à¤¡à¤¼à¥‡à¤‚',
    followCircle: 'à¤«à¥ˆà¤²à¤¤à¥‡ à¤¹à¥à¤ à¤µà¥ƒà¤¤à¥à¤¤ à¤•à¤¾ à¤…à¤¨à¥à¤¸à¤°à¤£ à¤•à¤°à¥‡à¤‚', cycle: 'à¤šà¤•à¥à¤°',
    calm: 'à¤¶à¤¾à¤‚à¤¤', moderate: 'à¤®à¤§à¥à¤¯à¤®', highStress: 'à¤‰à¤šà¥à¤š à¤¤à¤¨à¤¾à¤µ',
  },
  gentle: {
    title: 'à¤œà¥‡à¤‚à¤Ÿà¤² à¤¸à¤°à¥à¤š', subtitle: 'à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤¸à¤‚à¤¸à¤¾à¤§à¤¨ à¤–à¥‹à¤œà¥‡à¤‚ à¤”à¤° à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤¸à¤‚à¤ªà¤°à¥à¤•à¥‹à¤‚ à¤¤à¤• à¤ªà¤¹à¥à¤à¤šà¥‡à¤‚à¥¤',
    searchPlaceholder: 'à¤¸à¤‚à¤¸à¤¾à¤§à¤¨ à¤–à¥‹à¤œà¥‡à¤‚...', callAI: 'AI à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¥‰à¤²', callContact: 'à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¥‰à¤²',
    supportResources: 'à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤¸à¤‚à¤¸à¤¾à¤§à¤¨', trustedContacts: 'à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤¸à¤‚à¤ªà¤°à¥à¤•',
  },
  relief: {
    title: 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤°à¤¾à¤¹à¤¤', subtitle: 'à¤…à¤­à¤¿à¤­à¥‚à¤¤ à¤•à¥à¤·à¤£à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤›à¥‹à¤Ÿà¥‡ à¤‰à¤ªà¤•à¤°à¤£à¥¤',
    tabExercises: 'à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®', tabCondition: 'à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤…à¤¨à¥à¤¸à¤¾à¤°',
    breathing: 'à¤¶à¥à¤µà¤¾à¤¸ à¤°à¥€à¤¸à¥‡à¤Ÿ', breathingDesc: 'à¤à¤• à¤®à¤¿à¤¨à¤Ÿ à¤•à¤¾ à¤¶à¥à¤µà¤¾à¤¸ à¤°à¥€à¤¸à¥‡à¤Ÿà¥¤',
    audio: 'à¤¶à¤¾à¤‚à¤¤ à¤‘à¤¡à¤¿à¤¯à¥‹', audioDesc: 'à¤¬à¤¾à¤°à¤¿à¤¶, à¤²à¤¹à¤°à¥‡à¤‚, à¤¯à¤¾ à¤ªà¤¿à¤¯à¤¾à¤¨à¥‹à¥¤',
    reset: 'à¤°à¥€à¤¸à¥‡à¤Ÿ à¤µà¤¿à¤°à¤¾à¤®', resetDesc: 'à¤¶à¤°à¥€à¤° à¤•à¥‹ à¤¶à¤¾à¤‚à¤¤ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤¸à¤°à¤² à¤¸à¤‚à¤•à¥‡à¤¤à¥¤',
    gratitude: 'à¤•à¥ƒà¤¤à¤œà¥à¤žà¤¤à¤¾', gratitudeDesc: 'à¤à¤• à¤›à¥‹à¤Ÿà¤¾ à¤ªà¤² à¤œà¥‹ à¤…à¤šà¥à¤›à¤¾ à¤²à¤—à¤¾à¥¤',
    checkin: 'à¤•à¥‹à¤®à¤² à¤œà¤¾à¤à¤š', checkinDesc: 'à¤¤à¥€à¤¨ à¤•à¥‹à¤®à¤² à¤ªà¥à¤°à¤¶à¥à¤¨à¥¤',
    quiet: 'à¤¶à¤¾à¤‚à¤¤ à¤®à¥‹à¤¡', quietDesc: 'à¤—à¤¤à¤¿ à¤•à¤® à¤•à¤°à¥‡à¤‚ à¤”à¤° UI à¤•à¥‹ à¤¨à¤°à¤® à¤•à¤°à¥‡à¤‚à¥¤',
    breathingTitle: 'à¤¶à¥à¤µà¤¾à¤¸ à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®', breathingIn: 'à¤§à¥€à¤°à¥‡ à¤¸à¥‡ à¤¸à¤¾à¤à¤¸ à¤²à¥‡à¤‚...', breathingHold: 'à¤•à¥‹à¤®à¤²à¤¤à¤¾ à¤¸à¥‡ à¤°à¥‹à¤•à¥‡à¤‚...', breathingOut: 'à¤§à¥€à¤°à¥‡ à¤¸à¥‡ à¤›à¥‹à¤¡à¤¼à¥‡à¤‚...',
    audioTitle: 'à¤¶à¤¾à¤‚à¤¤ à¤§à¥à¤µà¤¨à¤¿à¤¯à¤¾à¤', audioSubtitle: 'à¤šà¤²à¤¾à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤Ÿà¥ˆà¤ª à¤•à¤°à¥‡à¤‚', playing: 'à¤šà¤² à¤°à¤¹à¤¾ à¤¹à¥ˆ',
    soundRain: 'à¤¹à¤²à¥à¤•à¥€ à¤¬à¤¾à¤°à¤¿à¤¶', soundWaves: 'à¤¸à¤®à¥à¤¦à¥à¤°à¥€ à¤²à¤¹à¤°à¥‡à¤‚', soundPiano: 'à¤¸à¥Œà¤®à¥à¤¯ à¤ªà¤¿à¤¯à¤¾à¤¨à¥‹',
    resetTitle: 'à¤°à¥€à¤¸à¥‡à¤Ÿ à¤µà¤¿à¤°à¤¾à¤®', resetSubtitle: 'à¤†à¤ªà¤•à¥‹ à¤µà¤¾à¤ªà¤¸ à¤²à¤¾à¤¨à¥‡ à¤•à¥‡ à¤¶à¤¾à¤°à¥€à¤°à¤¿à¤• à¤¸à¤‚à¤•à¥‡à¤¤',
    gratitudeTitle: 'à¤•à¥ƒà¤¤à¤œà¥à¤žà¤¤à¤¾ à¤•à¤¾ à¤ªà¤²', gratitudePlaceholder: 'à¤®à¥ˆà¤‚ à¤†à¤­à¤¾à¤°à¥€ à¤¹à¥‚à¤...', gratitudeEmpty: 'à¤†à¤ªà¤•à¥‡ à¤•à¥ƒà¤¤à¤œà¥à¤žà¤¤à¤¾ à¤¨à¥‹à¤Ÿà¥à¤¸ à¤¯à¤¹à¤¾à¤ à¤¦à¤¿à¤–à¥‡à¤‚à¤—à¥‡à¥¤',
    checkinTitle: 'à¤•à¥‹à¤®à¤² à¤œà¤¾à¤à¤š', checkinSubmit: 'à¤œà¤®à¤¾ à¤•à¤°à¥‡à¤‚',
    quietTitle: 'à¤¶à¤¾à¤‚à¤¤ à¤®à¥‹à¤¡', quietEnable: 'à¤¶à¤¾à¤‚à¤¤ à¤®à¥‹à¤¡ à¤šà¤¾à¤²à¥‚ à¤•à¤°à¥‡à¤‚', quietDisable: 'à¤¶à¤¾à¤‚à¤¤ à¤®à¥‹à¤¡ à¤¬à¤‚à¤¦ à¤•à¤°à¥‡à¤‚',
  },
  support: {
    title: 'à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¹à¥ˆ', prompt: 'à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤•à¤¿à¤¸à¥€ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¥‡à¤‚à¤—à¥‡?',
    noContacts: 'à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤¨à¤¹à¥€à¤‚', call: 'à¤•à¥‰à¤²', addContact: 'à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤œà¥‹à¤¡à¤¼à¥‡à¤‚',
    namePlaceholder: 'à¤¨à¤¾à¤®', phonePlaceholder: 'à¤«à¤¼à¥‹à¤¨', add: 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤œà¥‹à¤¡à¤¼à¥‡à¤‚',
    ngos: 'à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤µà¤¿à¤•à¤²à¥à¤ª', reachOut: 'à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤¤à¤• à¤ªà¤¹à¥à¤à¤šà¥‡à¤‚',
  },
  meds: {
    title: 'à¤¸à¥à¤®à¤¾à¤°à¥à¤Ÿ à¤¦à¤µà¤¾', subtitle: 'à¤•à¥‹à¤®à¤² à¤…à¤¨à¥à¤¸à¥à¤®à¤¾à¤°à¤• à¤œà¥‹ à¤†à¤ªà¤•à¥‡ à¤¸à¤¾à¤¥ à¤šà¤²à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤',
    addTitle: 'à¤¦à¤µà¤¾ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚', namePlaceholder: 'à¤¦à¤µà¤¾ à¤•à¤¾ à¤¨à¤¾à¤®',
    dosagePlaceholder: 'à¤–à¥à¤°à¤¾à¤• (à¤œà¥ˆà¤¸à¥‡ 500 mg)', add: 'à¤œà¥‹à¤¡à¤¼à¥‡à¤‚',
    scheduleTitle: 'à¤¦à¥ˆà¤¨à¤¿à¤• à¤…à¤¨à¥à¤¸à¥‚à¤šà¥€', noSchedule: 'à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤…à¤¨à¥à¤¸à¥‚à¤šà¥€ à¤¨à¤¹à¥€à¤‚',
    taken: 'à¤²à¥€ à¤—à¤ˆ', remind: 'à¤¯à¤¾à¤¦ à¤¦à¤¿à¤²à¤¾à¤à¤',
  },
};

const makeLang = (overrides) => ({
  ...en,
  nav: { ...en.nav, ...overrides.nav },
  sidebar: { ...en.sidebar, ...overrides.sidebar },
  hero: { ...en.hero, ...overrides.hero },
  auth: { ...en.auth, ...overrides.auth },
  dashboard: { ...en.dashboard, ...overrides.dashboard },
  dashCards: { ...en.dashCards, ...overrides.dashCards },
  mood: { ...en.mood, ...overrides.mood },
  gentle: { ...en.gentle, ...overrides.gentle },
  relief: { ...en.relief, ...overrides.relief },
  settings: { ...en.settings, ...overrides.settings },
  meds: { ...en.meds, ...overrides.meds },
  support: { ...en.support, ...overrides.support },
  footer: { ...en.footer, ...overrides.footer },
  contact: { ...en.contact, ...overrides.contact },
  common: { ...en.common, ...overrides.common },
});
});

const ta = makeLang({
  sidebar: { dashboard: 'à®Ÿà®¾à®·à¯à®ªà¯‹à®°à¯à®Ÿà¯', features: 'à®…à®®à¯à®šà®™à¯à®•à®³à¯', relief: 'à®µà®¿à®°à¯ˆà®µà¯ à®¨à®¿à®µà®¾à®°à®£à®®à¯', games: 'à®µà®¿à®³à¯ˆà®¯à®¾à®Ÿà¯à®Ÿà¯', resources: 'à®µà®³à®™à¯à®•à®³à¯', gentlereach: 'à®œà¯†à®©à¯à®Ÿà®¿à®²à¯à®°à¯€à®šà¯', settings: 'à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯', moodsense: 'à®®à¯‚à®Ÿà¯à®šà¯†à®£à¯à®¸à¯ à®¤à¯à®£à¯ˆ', gentleSearch: 'à®®à¯†à®©à¯à®¤à¯‡à®Ÿà®²à¯' },
  nav: { home: 'à®®à¯à®•à®ªà¯à®ªà¯', login: 'à®‰à®³à¯à®¨à¯à®´à¯ˆ', logout: 'à®µà¯†à®³à®¿à®¯à¯‡à®±à¯', getStarted: 'à®¤à¯Šà®Ÿà®™à¯à®•à¯', moodsense: 'à®®à¯‚à®Ÿà¯à®šà¯†à®£à¯à®¸à¯ à®¤à¯à®£à¯ˆ', gentleSearch: 'à®®à¯†à®©à¯à®¤à¯‡à®Ÿà®²à¯' },
  hero: { title: 'à®¨à¯€à®™à¯à®•à®³à¯ à®…à®©à¯ˆà®µà®°à¯ˆà®¯à¯à®®à¯ à®•à®µà®©à®¿à®•à¯à®•à®¿à®±à¯€à®°à¯à®•à®³à¯.', title2: 'à®¨à®¾à®™à¯à®•à®³à¯ à®‰à®™à¯à®•à®³à¯à®•à¯à®•à®¾à®• à®‡à®°à¯à®•à¯à®•à®¿à®±à¯‹à®®à¯.', subtitle: 'à®‰à®™à¯à®•à®³à¯ à®…à®´à¯à®¤à¯à®¤à®¤à¯à®¤à¯ˆ à®ªà¯à®°à®¿à®¨à¯à®¤à¯à®•à¯Šà®³à¯à®³à¯à®®à¯ à®…à®®à¯ˆà®¤à®¿à®¯à®¾à®© à®¤à¯à®£à¯ˆ.', ctaPrimary: 'à®®à¯†à®¤à¯à®µà®¾à®• à®¤à¯Šà®Ÿà®™à¯à®•à¯' },
  auth: { loginTitle: 'à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®µà®°à®µà¯‡à®±à¯à®•à®¿à®±à¯‹à®®à¯', signupTitle: 'à®‰à®™à¯à®•à®³à¯à®•à¯à®•à®¾à®© à®‡à®Ÿà®®à¯', login: 'à®‰à®³à¯à®¨à¯à®´à¯ˆ', signup: 'à®•à®£à®•à¯à®•à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯' },
  dashboard: { speakTitle: 'à®®à®©à®¤à®¿à®²à¯ à®Žà®©à¯à®©?', send: 'à®ªà®•à®¿à®°à¯', speak: 'à®ªà¯‡à®šà¯', goodMorning: 'à®•à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯', goodAfternoon: 'à®®à®¤à®¿à®¯ à®µà®£à®•à¯à®•à®®à¯', goodEvening: 'à®®à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯' },
  dashCards: { focusToday: 'à®‡à®©à¯à®±à¯ à®Žà®¤à®¿à®²à¯ à®•à®µà®©à®®à¯ à®šà¯†à®²à¯à®¤à¯à®¤ à®µà®¿à®°à¯à®®à¯à®ªà¯à®•à®¿à®±à¯€à®°à¯à®•à®³à¯?', tryRelief: 'à®µà®¿à®°à¯ˆà®µà¯ à®¨à®¿à®µà®¾à®°à®£à®®à¯ à®®à¯à®¯à®±à¯à®šà®¿à®•à¯à®•à®µà¯à®®à¯' },
});

const te = makeLang({ sidebar: { dashboard: 'à°¡à±à°¯à°¾à°·à±â€Œà°¬à±‹à°°à±à°¡à±', features: 'à°«à±€à°šà°°à±à°²à±', relief: 'à°¤à±à°µà°°à°¿à°¤ à°‰à°ªà°¶à°®à°¨à°‚', games: 'à°—à±‡à°®à± à°œà±‹à°¨à±', resources: 'à°µà°¨à°°à±à°²à±', settings: 'à°¸à±†à°Ÿà±à°Ÿà°¿à°‚à°—à±â€Œà°²à±' }, nav: { home: 'à°¹à±‹à°®à±', login: 'à°¸à±ˆà°¨à± à°‡à°¨à±', logout: 'à°¸à±ˆà°¨à± à°…à°µà±à°Ÿà±', getStarted: 'à°ªà±à°°à°¾à°°à°‚à°­à°¿à°‚à°šà±' }, hero: { title: 'à°®à±€à°°à± à°…à°‚à°¦à°°à°¿à°¨à±€ à°šà±‚à°¸à±à°•à±à°‚à°Ÿà°¾à°°à±.', title2: 'à°®à±‡à°®à± à°®à±€ à°•à±‹à°¸à°‚ à°‰à°¨à±à°¨à°¾à°®à±.', ctaPrimary: 'à°®à±†à°²à±à°²à°—à°¾ à°ªà±à°°à°¾à°°à°‚à°­à°¿à°‚à°šà±' }, auth: { loginTitle: 'à°¤à°¿à°°à°¿à°—à°¿ à°¸à±à°µà°¾à°—à°¤à°‚', login: 'à°¸à±ˆà°¨à± à°‡à°¨à±', signup: 'à°–à°¾à°¤à°¾ à°¸à±ƒà°·à±à°Ÿà°¿à°‚à°šà±' }, dashboard: { speakTitle: 'à°®à°¨à°¸à±à°²à±‹ à°à°®à±à°‚à°¦à°¿?', send: 'à°ªà°‚à°šà±', speak: 'à°šà±†à°ªà±à°ªà±', goodMorning: 'à°¶à±à°­à±‹à°¦à°¯à°‚', goodAfternoon: 'à°¶à±à°­ à°®à°§à±à°¯à°¾à°¹à±à°¨à°‚', goodEvening: 'à°¶à±à°­ à°¸à°¾à°¯à°‚à°¤à±à°°à°‚' } });
const kn = makeLang({ sidebar: { dashboard: 'à²¡à³à²¯à²¾à²¶à³â€Œà²¬à³‹à²°à³à²¡à³', features: 'à²µà³ˆà²¶à²¿à²·à³à²Ÿà³à²¯à²—à²³à³', relief: 'à²¤à³à²µà²°à²¿à²¤ à²ªà²°à²¿à²¹à²¾à²°', games: 'à²†à²Ÿà²¦ à²µà²²à²¯', resources: 'à²¸à²‚à²ªà²¨à³à²®à³‚à²²à²—à²³à³', settings: 'à²¸à³†à²Ÿà³à²Ÿà²¿à²‚à²—à³â€Œà²—à²³à³' }, nav: { home: 'à²®à³à²–à²ªà³à²Ÿ', login: 'à²¸à³ˆà²¨à³ à²‡à²¨à³', logout: 'à²¸à³ˆà²¨à³ à²”à²Ÿà³' }, hero: { title: 'à²¨à³€à²µà³ à²Žà²²à³à²²à²°à²¨à³à²¨à³‚ à²¨à³‹à²¡à²¿à²•à³Šà²³à³à²³à³à²¤à³à²¤à³€à²°à²¿.', title2: 'à²¨à²¾à²µà³ à²¨à²¿à²®à²—à²¾à²—à²¿ à²‡à²¦à³à²¦à³‡à²µà³†.' }, auth: { loginTitle: 'à²®à²°à²³à²¿ à²¸à³à²µà²¾à²—à²¤', login: 'à²¸à³ˆà²¨à³ à²‡à²¨à³' }, dashboard: { speakTitle: 'à²®à²¨à²¸à³à²¸à²²à³à²²à²¿ à²à²¨à²¿à²¦à³†?', send: 'à²¹à²‚à²šà³', goodMorning: 'à²¶à³à²­à³‹à²¦à²¯', goodAfternoon: 'à²¶à³à²­ à²®à²§à³à²¯à²¾à²¹à³à²¨', goodEvening: 'à²¶à³à²­ à²¸à²‚à²œà³†' } });
const ml = makeLang({ sidebar: { dashboard: 'à´¡à´¾à´·àµâ€Œà´¬àµ‹àµ¼à´¡àµ', features: 'à´«àµ€à´šàµà´šà´±àµà´•àµ¾', relief: 'à´¦àµà´°àµà´¤ à´†à´¶àµà´µà´¾à´¸à´‚', games: 'à´—àµ†à´¯à´¿à´‚ à´¸àµ‹àµº', resources: 'à´µà´¿à´­à´µà´™àµà´™àµ¾', settings: 'à´•àµà´°à´®àµ€à´•à´°à´£à´™àµà´™àµ¾' }, nav: { home: 'à´¹àµ‹à´‚', login: 'à´¸àµˆàµ» à´‡àµ»', logout: 'à´¸àµˆàµ» à´”à´Ÿàµà´Ÿàµ' }, hero: { title: 'à´¨à´¿à´™àµà´™àµ¾ à´Žà´²àµà´²à´¾à´µà´°àµ†à´¯àµà´‚ à´¶àµà´°à´¦àµà´§à´¿à´•àµà´•àµà´¨àµà´¨àµ.', title2: 'à´žà´™àµà´™àµ¾ à´¨à´¿à´™àµà´™àµ¾à´•àµà´•àµŠà´ªàµà´ªà´®àµà´£àµà´Ÿàµ.' }, auth: { loginTitle: 'à´¤à´¿à´°à´¿à´•àµ† à´¸àµà´µà´¾à´—à´¤à´‚', login: 'à´¸àµˆàµ» à´‡àµ»' }, dashboard: { speakTitle: 'à´®à´¨à´¸àµà´¸à´¿àµ½ à´Žà´¨àµà´¤à´¾à´£àµ?', send: 'à´ªà´™àµà´•à´¿à´Ÿàµ‚' } });
const bn = makeLang({ sidebar: { dashboard: 'à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡', features: 'à¦¬à§ˆà¦¶à¦¿à¦·à§à¦Ÿà§à¦¯', relief: 'à¦¦à§à¦°à§à¦¤ à¦¸à§à¦¬à¦¸à§à¦¤à¦¿', games: 'à¦—à§‡à¦® à¦œà§‹à¦¨', resources: 'à¦¸à¦®à§à¦ªà¦¦', settings: 'à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸' }, nav: { home: 'à¦¹à§‹à¦®', login: 'à¦¸à¦¾à¦‡à¦¨ à¦‡à¦¨', logout: 'à¦¸à¦¾à¦‡à¦¨ à¦†à¦‰à¦Ÿ', getStarted: 'à¦¶à§à¦°à§ à¦•à¦°à§à¦¨' }, hero: { title: 'à¦†à¦ªà¦¨à¦¿ à¦¸à¦¬à¦¾à¦° à¦¯à¦¤à§à¦¨ à¦¨à§‡à¦¨à¥¤', title2: 'à¦†à¦®à¦°à¦¾ à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦¾à¦¶à§‡ à¦†à¦›à¦¿à¥¤' }, auth: { loginTitle: 'à¦†à¦¬à¦¾à¦° à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®', login: 'à¦¸à¦¾à¦‡à¦¨ à¦‡à¦¨', signup: 'à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨' }, dashboard: { speakTitle: 'à¦®à¦¨à§‡ à¦•à§€ à¦šà¦²à¦›à§‡?', send: 'à¦¶à§‡à¦¯à¦¼à¦¾à¦° à¦•à¦°à§à¦¨', speak: 'à¦¬à¦²à§à¦¨', goodMorning: 'à¦¸à§à¦ªà§à¦°à¦­à¦¾à¦¤', goodAfternoon: 'à¦¶à§à¦­ à¦¦à§à¦ªà§à¦°', goodEvening: 'à¦¶à§à¦­ à¦¸à¦¨à§à¦§à§à¦¯à¦¾' } });
const mr = makeLang({ sidebar: { dashboard: 'à¤¡à¥…à¤¶à¤¬à¥‹à¤°à¥à¤¡', features: 'à¤µà¥ˆà¤¶à¤¿à¤·à¥à¤Ÿà¥à¤¯à¥‡', relief: 'à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤¦à¤¿à¤²à¤¾à¤¸à¤¾', games: 'à¤—à¥‡à¤® à¤à¥‹à¤¨', resources: 'à¤¸à¤‚à¤¸à¤¾à¤§à¤¨à¥‡', settings: 'à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤œ' }, nav: { home: 'à¤®à¥à¤–à¤ªà¥ƒà¤·à¥à¤ ', login: 'à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨', logout: 'à¤¸à¤¾à¤‡à¤¨ à¤†à¤‰à¤Ÿ' }, hero: { title: 'à¤¤à¥à¤®à¥à¤¹à¥€ à¤¸à¤—à¤³à¥à¤¯à¤¾à¤‚à¤šà¥€ à¤•à¤¾à¤³à¤œà¥€ à¤˜à¥‡à¤¤à¤¾.', title2: 'à¤†à¤®à¥à¤¹à¥€ à¤¤à¥à¤®à¤šà¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤†à¤¹à¥‹à¤¤.' }, auth: { loginTitle: 'à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤¸à¥à¤µà¤¾à¤—à¤¤', login: 'à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨' }, dashboard: { speakTitle: 'à¤®à¤¨à¤¾à¤¤ à¤•à¤¾à¤¯ à¤†à¤¹à¥‡?', send: 'à¤¶à¥‡à¤…à¤° à¤•à¤°à¤¾' } });
const gu = makeLang({ sidebar: { dashboard: 'àª¡à«‡àª¶àª¬à«‹àª°à«àª¡', features: 'àª«à«€àªšàª°à«àª¸', relief: 'àªàª¡àªªà«€ àª°àª¾àª¹àª¤', games: 'àª—à«‡àª® àªà«‹àª¨', resources: 'àª¸àª‚àª¸àª¾àª§àª¨à«‹', settings: 'àª¸à«‡àªŸàª¿àª‚àª—à«àª¸' }, nav: { home: 'àª¹à«‹àª®', login: 'àª¸àª¾àª‡àª¨ àª‡àª¨', logout: 'àª¸àª¾àª‡àª¨ àª†àª‰àªŸ' }, hero: { title: 'àª¤àª®à«‡ àª¬àª§àª¾àª¨à«€ àª¸àª‚àª­àª¾àª³ àª°àª¾àª–à«‹ àª›à«‹.', title2: 'àª…àª®à«‡ àª¤àª®àª¾àª°àª¾ àª®àª¾àªŸà«‡ àª›à«€àª.' }, auth: { loginTitle: 'àª«àª°à«€ àª¸à«àªµàª¾àª—àª¤', login: 'àª¸àª¾àª‡àª¨ àª‡àª¨' }, dashboard: { speakTitle: 'àª®àª¨àª®àª¾àª‚ àª¶à«àª‚ àª›à«‡?', send: 'àª¶à«‡àª° àª•àª°à«‹' } });
const pa = makeLang({ sidebar: { dashboard: 'à¨¡à©ˆà¨¸à¨¼à¨¬à©‹à¨°à¨¡', features: 'à¨µà¨¿à¨¸à¨¼à©‡à¨¸à¨¼à¨¤à¨¾à¨µà¨¾à¨‚', relief: 'à¨¤à©à¨°à©°à¨¤ à¨°à¨¾à¨¹à¨¤', games: 'à¨—à©‡à¨® à¨œà¨¼à©‹à¨¨', resources: 'à¨¸à¨°à©‹à¨¤', settings: 'à¨¸à©ˆà¨Ÿà¨¿à©°à¨—à¨œà¨¼' }, nav: { home: 'à¨¹à©‹à¨®', login: 'à¨¸à¨¾à¨ˆà¨¨ à¨‡à¨¨', logout: 'à¨¸à¨¾à¨ˆà¨¨ à¨†à¨‰à¨Ÿ' }, hero: { title: 'à¨¤à©à¨¸à©€à¨‚ à¨¸à¨­ à¨¦à¨¾ à¨–à¨¿à¨†à¨² à¨°à©±à¨–à¨¦à©‡ à¨¹à©‹à¥¤', title2: 'à¨…à¨¸à©€à¨‚ à¨¤à©à¨¹à¨¾à¨¡à©‡ à¨²à¨ˆ à¨¹à¨¾à¨‚à¥¤' }, auth: { loginTitle: 'à¨®à©à©œ à¨¸à©à¨†à¨—à¨¤', login: 'à¨¸à¨¾à¨ˆà¨¨ à¨‡à¨¨' }, dashboard: { speakTitle: 'à¨®à¨¨ à¨µà¨¿à©±à¨š à¨•à©€ à¨¹à©ˆ?', send: 'à¨¸à¨¾à¨‚à¨à¨¾ à¨•à¨°à©‹' } });
const ur = makeLang({ sidebar: { dashboard: 'ÚˆÛŒØ´ Ø¨ÙˆØ±Úˆ', features: 'ÙÛŒÚ†Ø±Ø²', relief: 'ÙÙˆØ±ÛŒ Ø³Ú©ÙˆÙ†', games: 'Ú¯ÛŒÙ… Ø²ÙˆÙ†', resources: 'ÙˆØ³Ø§Ø¦Ù„', settings: 'ØªØ±ØªÛŒØ¨Ø§Øª' }, nav: { home: 'ÛÙˆÙ…', login: 'Ø³Ø§Ø¦Ù† Ø§Ù†', logout: 'Ø³Ø§Ø¦Ù† Ø¢Ø¤Ù¹' }, hero: { title: 'Ø¢Ù¾ Ø³Ø¨ Ú©Ø§ Ø®ÛŒØ§Ù„ Ø±Ú©Ú¾ØªÛ’ ÛÛŒÚºÛ”', title2: 'ÛÙ… Ø¢Ù¾ Ú©Û’ Ù„ÛŒÛ’ ÛÛŒÚºÛ”' }, auth: { loginTitle: 'ÙˆØ§Ù¾Ø³ÛŒ Ù¾Ø± Ø®ÙˆØ´ Ø¢Ù…Ø¯ÛŒØ¯', login: 'Ø³Ø§Ø¦Ù† Ø§Ù†' }, dashboard: { speakTitle: 'Ø¯Ù„ Ù…ÛŒÚº Ú©ÛŒØ§ ÛÛ’ØŸ', send: 'Ø´ÛŒØ¦Ø± Ú©Ø±ÛŒÚº' } });
const or2 = makeLang({ sidebar: { dashboard: 'à¬¡à­à­Ÿà¬¾à¬¸à¬¬à­‹à¬°à­à¬¡', features: 'à¬¬à­ˆà¬¶à¬¿à¬·à­à¬Ÿà­à­Ÿ', relief: 'à¬¶à­€à¬˜à­à¬° à¬†à¬°à¬¾à¬®', games: 'à¬—à­‡à¬®à­ à¬œà­‹à¬¨à­', resources: 'à¬¸à¬®à­à¬¬à¬³', settings: 'à¬¸à­‡à¬Ÿà¬¿à¬‚à¬¸' }, nav: { home: 'à¬¹à­‹à¬®', login: 'à¬¸à¬¾à¬‡à¬¨ à¬‡à¬¨', logout: 'à¬¸à¬¾à¬‡à¬¨ à¬†à¬‰à¬Ÿ' }, hero: { title: 'à¬†à¬ªà¬£ à¬¸à¬®à¬¸à­à¬¤à¬™à­à¬• à¬¯à¬¤à­à¬¨ à¬¨à¬¿à¬…à¬¨à­à¬¤à¬¿à¥¤', title2: 'à¬†à¬®à­‡ à¬†à¬ªà¬£à¬™à­à¬• à¬ªà¬¾à¬‡à¬ à¬…à¬›à­à¥¤' }, auth: { loginTitle: 'à¬ªà­à¬£à¬¿ à¬¸à­à­±à¬¾à¬—à¬¤', login: 'à¬¸à¬¾à¬‡à¬¨ à¬‡à¬¨' }, dashboard: { speakTitle: 'à¬®à¬¨à¬°à­‡ à¬•à¬£ à¬…à¬›à¬¿?', send: 'à¬¶à­‡à­Ÿà¬¾à¬°' } });
const as2 = makeLang({ sidebar: { dashboard: "à¦¡à§‡à¦šà¦¬'à§°à§à¦¡", features: 'à¦¬à§ˆà¦¶à¦¿à¦·à§à¦Ÿà§à¦¯', relief: 'à¦¦à§à§°à§à¦¤ à¦¸à¦•à¦¾à¦¹', games: "à¦—à§‡à¦® à¦œ'à¦¨", resources: 'à¦¸à¦®à§à¦ªà¦¦', settings: 'à¦›à§‡à¦Ÿà¦¿à¦‚à¦›' }, nav: { home: 'à¦¹à§‹à¦®', login: 'à¦›à¦¾à¦‡à¦¨ à¦‡à¦¨', logout: 'à¦›à¦¾à¦‡à¦¨ à¦†à¦‰à¦Ÿ' }, hero: { title: 'à¦†à¦ªà§à¦¨à¦¿ à¦¸à¦•à¦²à§‹à§°à§‡ à¦¯à¦¤à¦¨ à¦²à¦¯à¦¼à¥¤', title2: 'à¦†à¦®à¦¿ à¦†à¦ªà§‹à¦¨à¦¾à§° à¦²à¦—à¦¤ à¦†à¦›à§‹à¦à¥¤' }, auth: { loginTitle: 'à¦ªà§à¦¨à§° à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®', login: 'à¦›à¦¾à¦‡à¦¨ à¦‡à¦¨' }, dashboard: { speakTitle: 'à¦®à¦¨à¦¤ à¦•à¦¿ à¦†à¦›à§‡?', send: 'à¦¶à§à¦¬à§‡à¦¯à¦¼à¦¾à§° à¦•à§°à¦•' } });
const ja = makeLang({ sidebar: { dashboard: 'ãƒ€ãƒƒã‚·ãƒ¥ãƒœãƒ¼ãƒ‰', features: 'æ©Ÿèƒ½', relief: 'ã‚¯ã‚¤ãƒƒã‚¯ãƒªãƒªãƒ¼ãƒ•', games: 'ã‚²ãƒ¼ãƒ ã‚¾ãƒ¼ãƒ³', resources: 'ãƒªã‚½ãƒ¼ã‚¹', companion: 'AIã‚³ãƒ³ãƒ‘ãƒ‹ã‚ªãƒ³', medications: 'ã‚¹ãƒžãƒ¼ãƒˆæŠ•è–¬', settings: 'è¨­å®š', moodsense: 'ãƒ ãƒ¼ãƒ‰ã‚»ãƒ³ã‚¹', gentleSearch: 'ã‚¸ã‚§ãƒ³ãƒˆãƒ«ã‚µãƒ¼ãƒ' }, nav: { home: 'ãƒ›ãƒ¼ãƒ ', login: 'ã‚µã‚¤ãƒ³ã‚¤ãƒ³', logout: 'ã‚µã‚¤ãƒ³ã‚¢ã‚¦ãƒˆ', getStarted: 'å§‹ã‚ã‚‹', moodsense: 'ãƒ ãƒ¼ãƒ‰ã‚»ãƒ³ã‚¹', gentleSearch: 'ã‚¸ã‚§ãƒ³ãƒˆãƒ«ã‚µãƒ¼ãƒ' }, hero: { title: 'ã¿ã‚“ãªã®ä¸–è©±ã‚’ã—ã¦ã„ã¾ã™ã€‚', title2: 'ç§ãŸã¡ãŒãã°ã«ã„ã¾ã™ã€‚', ctaPrimary: 'å„ªã—ãå§‹ã‚ã‚‹' }, auth: { loginTitle: 'ãŠã‹ãˆã‚Šãªã•ã„', login: 'ã‚µã‚¤ãƒ³ã‚¤ãƒ³', signup: 'ã‚¢ã‚«ã‚¦ãƒ³ãƒˆä½œæˆ' }, dashboard: { speakTitle: 'ä½•ã‚’è€ƒãˆã¦ã„ã¾ã™ã‹ï¼Ÿ', send: 'å…±æœ‰ã™ã‚‹', speak: 'è©±ã™', goodMorning: 'ãŠã¯ã‚ˆã†ã”ã–ã„ã¾ã™', goodAfternoon: 'ã“ã‚“ã«ã¡ã¯', goodEvening: 'ã“ã‚“ã°ã‚“ã¯' }, dashCards: { focusToday: 'ä»Šæ—¥ã¯ä½•ã«é›†ä¸­ã—ã¾ã™ã‹ï¼Ÿ', tryRelief: 'ã‚¯ã‚¤ãƒƒã‚¯ãƒªãƒªãƒ¼ãƒ•ã‚’è©¦ã™' } });
const ko = makeLang({ sidebar: { dashboard: 'ëŒ€ì‹œë³´ë“œ', features: 'ê¸°ëŠ¥', relief: 'ë¹ ë¥¸ ì•ˆë„', games: 'ê²Œìž„ ì¡´', resources: 'ìžì›', companion: 'AI ë™ë°˜ìž', medications: 'ìŠ¤ë§ˆíŠ¸ ì•½ë¬¼', settings: 'ì„¤ì •', moodsense: 'ë¬´ë“œì„¼ìŠ¤', gentleSearch: 'ì  í‹€ ì„œì¹˜' }, nav: { home: 'í™ˆ', login: 'ë¡œê·¸ì¸', logout: 'ë¡œê·¸ì•„ì›ƒ', getStarted: 'ì‹œìž‘í•˜ê¸°', moodsense: 'ë¬´ë“œì„¼ìŠ¤', gentleSearch: 'ì  í‹€ ì„œì¹˜' }, hero: { title: 'ë‹¹ì‹ ì€ ëª¨ë“  ì‚¬ëžŒì„ ëŒë´…ë‹ˆë‹¤.', title2: 'ìš°ë¦¬ê°€ ë‹¹ì‹ ê³¼ í•¨ê»˜í•©ë‹ˆë‹¤.', ctaPrimary: 'ë¶€ë“œëŸ½ê²Œ ì‹œìž‘' }, auth: { loginTitle: 'ë‹¤ì‹œ ì˜¤ì‹  ê²ƒì„ í™˜ì˜í•©ë‹ˆë‹¤', login: 'ë¡œê·¸ì¸', signup: 'ê³„ì • ë§Œë“¤ê¸°' }, dashboard: { speakTitle: 'ë§ˆìŒì— ë¬´ì—‡ì´ ìžˆë‚˜ìš”?', send: 'ê³µìœ ', speak: 'ë§í•˜ê¸°', goodMorning: 'ì¢‹ì€ ì•„ì¹¨', goodAfternoon: 'ì¢‹ì€ ì˜¤í›„', goodEvening: 'ì¢‹ì€ ì €ë…' }, dashCards: { focusToday: 'ì˜¤ëŠ˜ ë¬´ì—‡ì— ì§‘ì¤‘í•˜ì‹œê² ìŠµë‹ˆê¹Œ?', tryRelief: 'ë¹ ë¥¸ ì•ˆë„ ì‹œë„' } });
const zh = makeLang({ sidebar: { dashboard: 'ä»ªè¡¨æ¿', features: 'åŠŸèƒ½', relief: 'å¿«é€Ÿç¼“è§£', games: 'æ¸¸æˆåŒº', resources: 'èµ„æº', companion: 'AIä¼™ä¼´', medications: 'æ™ºèƒ½è¯ç‰©', settings: 'è®¾ç½®', moodsense: 'æƒ…ç»ªæ„ŸçŸ¥', gentleSearch: 'æ¸©æŸ”æœç´¢' }, nav: { home: 'é¦–é¡µ', login: 'ç™»å½•', logout: 'é€€å‡º', getStarted: 'å¼€å§‹', moodsense: 'æƒ…ç»ªæ„ŸçŸ¥', gentleSearch: 'æ¸©æŸ”æœç´¢' }, hero: { title: 'ä½ ç…§é¡¾ç€æ¯ä¸ªäººã€‚', title2: 'æˆ‘ä»¬åœ¨ä½ èº«è¾¹ã€‚', ctaPrimary: 'è½»è½»å¼€å§‹' }, auth: { loginTitle: 'æ¬¢è¿Žå›žæ¥', login: 'ç™»å½•', signup: 'åˆ›å»ºè´¦æˆ·' }, dashboard: { speakTitle: 'å¿ƒé‡Œåœ¨æƒ³ä»€ä¹ˆï¼Ÿ', send: 'åˆ†äº«', speak: 'è¯´è¯', goodMorning: 'æ—©ä¸Šå¥½', goodAfternoon: 'ä¸‹åˆå¥½', goodEvening: 'æ™šä¸Šå¥½' }, dashCards: { focusToday: 'ä»Šå¤©æƒ³å…³æ³¨ä»€ä¹ˆï¼Ÿ', tryRelief: 'å°è¯•å¿«é€Ÿç¼“è§£' } });

const resources = {
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
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('with_u_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
