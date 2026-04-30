<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=42&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&lines=WITH_U;A+quiet+companion+for+caregivers" alt="WITH_U" />
</p>

<p align="center">
  <em>A non-intrusive, emotionally intelligent web app that listens softly, detects stress patterns over time, and offers gentle, non-clinical support for caregivers and anyone carrying emotional weight.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0066?style=flat-square&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/ElevenLabs-TTS-000?style=flat-square" />
  <img src="https://img.shields.io/badge/AssemblyAI-STT-FF6B00?style=flat-square" />
  <img src="https://img.shields.io/badge/Retell_AI-Voice_Calls-6C3DD1?style=flat-square" />
  <img src="https://img.shields.io/badge/Twilio-SMS_%26_Calls-F22F46?style=flat-square&logo=twilio&logoColor=white" />
  <img src="https://img.shields.io/badge/face--api.js-Emotion_Detection-FF6F61?style=flat-square" />
</p>

---

## 🌟 What is WITH_U?

**WITH_U** is a full-stack caregiver wellness platform that combines **AI conversation**, **real-time facial emotion detection**, **smart medication management**, **quick mental health relief exercises**, and **multi-channel emergency support** — all wrapped in a warm, glassmorphism-styled interface.

> _"The system is passive — it never demands input or pings the user. It uses soft phrases only: 'you've been carrying a lot', 'maybe a small pause'. Never clinical terms."_

---

## ✨ Core Features

### 🤖 Aira — AI Companion
- **Conversational AI** powered by Google Gemini — understands context, emotional state, and responds empathetically in **11 Indian languages** (English, Hindi, Kannada, Tamil, Telugu, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu)
- **3D animated avatar** (Three.js FBX models) with idle, speaking, listening, breathing, and calming animations
- **Invisible stress detection** — tracks typing patterns (hesitation, backspacing), session duration, late-night usage, and screen time to compute stress *without asking*
- **Real-time voice conversations** via Retell AI SDK (WebRTC-based AI calling)
- **Text-to-Speech** (ElevenLabs server-side + browser SpeechSynthesis with per-language voice selection)
- **Speech-to-Text** (AssemblyAI transcription for voice journaling)
- **Smart tool invocation** — Aira automatically suggests breathing exercises, gratitude prompts, or external help based on stress levels
- **Session history** — full conversation history with per-message stress scores, persistent across sessions

### 💊 Smart Medication Manager
- Add medications with name, dosage, frequency, time schedules, color coding, and icons
- **Quick-pick presets** for 18 common medications (Paracetamol, Ibuprofen, Vitamin D3, etc.)
- **Multi-channel reminders**: WhatsApp (Twilio), SMS (Twilio), Email (Nodemailer) — all configurable per medication
- **Email verification flow** for email reminders (confirmation + resend)
- **Today's schedule timeline** + adherence stats with streak tracking
- **Mark as taken** logging with daily adherence percentage ring
- **Aira integration** — say "remind me to take Paracetamol at 8 AM" and Aira pre-fills the medication form

### 🌬️ Quick Relief Toolkit
Seven interactive self-care exercises, each with rich animations:

| Exercise | Duration | Technique |
|---|---|---|
| 🌬️ **Breathing Reset** | ~1 min | 4-4-6 inhale-hold-exhale with animated expanding circle |
| 🎧 **Calming Audio** | Any time | Rain, Ocean, Piano, Wind — hybrid MP3 + procedural Web Audio API |
| 🧘 **Reset Pause** | ~30 sec | Guided body scan (shoulders → jaw → silence) |
| ✨ **One Small Gratitude** | ~1 min | Gratitude journaling prompt with gentle responses |
| 💆 **Muscle Relaxation** | ~3 min | Progressive 5-group tense-and-release |
| 🌍 **5-4-3-2-1 Grounding** | ~2 min | Interactive sensory grounding (see → touch → hear → smell → taste) |
| 🌄 **Visualization Journey** | ~2 min | Choose Forest, Beach, or Mountain — guided scene narration |

Plus **condition-based guidance** for Anxiety, Depression, Stress, Sleep Issues, Anger, and Loneliness.

### 🧠 MoodSense — Real-Time Emotion Detection
- **Live webcam emotion detection** using `face-api.js` (TinyFaceDetector + FaceExpressions)
- Detects 7 emotions: happy, sad, angry, fearful, neutral, surprised, disgusted
- **Real-time stress meter** with color-coded levels
- **Aira AI avatar** providing contextual wellness messages based on detected emotion
- **Emotion timeline** tracking mood shifts over the session
- **Breathing exercise integration** (4-7-8 technique) triggered by high stress
- 🔒 **Privacy-first**: camera feed stays 100% on-device, nothing recorded or uploaded

### 🆘 Gentle Search — Emergency Support
- **AI Support Call**: WITH_U calls your phone with a calming voice message (Twilio + Retell AI)
- **24/7 Helpline directory**: iCall, Vandrevala Foundation, AASRA — with one-tap direct call + in-app calling
- **GentleReach system**: Trusted contact management with automatic soft outreach when stress trends worsen over 3+ days

### 📞 Call Aira
- Full-screen voice call interface with Retell AI
- Real-time audio waveform visualization
- Natural AI conversation with empathetic responses

---

## 🏗️ Architecture

```
WITH_U/
├── client/              # Vite + React 18 + TailwindCSS frontend
│   ├── src/
│   │   ├── pages/       # 21 page components
│   │   ├── components/  # 19 reusable components + mood subcomponents
│   │   ├── contexts/    # AuthContext, ThemeContext
│   │   ├── services/    # API, auth, voice, medication, stress, Aira services
│   │   ├── locales/     # i18n translations (English + Hindi)
│   │   └── styles/      # TailwindCSS + glassmorphism utilities
│   └── public/          # Static assets, face-api models
│
├── server/              # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # 13 Mongoose models
│   │   ├── routes/      # 27 route modules (v1 + v2)
│   │   ├── services/    # 20 service modules
│   │   ├── middleware/   # Auth, rate limiting, error handling
│   │   ├── ai/          # Gemini AI integration
│   │   ├── integrations/# Third-party service connectors
│   │   ├── jobs/        # Scheduled tasks
│   │   ├── notifications/# Push notification handlers
│   │   └── websocket/   # Real-time WebSocket events
│   ├── Dockerfile       # Production container
│   └── docker-compose.yml # Full stack orchestration
│
├── Aira/                # 3D avatar FBX animation files
│   ├── Standing Greeting.fbx
│   ├── Talking.fbx
│   ├── Thinking.fbx
│   ├── Laughing.fbx
│   └── ...
│
└── database/            # DB scripts and seeds
```

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Vite + React 18** | Build tooling + UI framework |
| **TailwindCSS 3.4** | Utility-first styling with custom warm/sage palette |
| **Framer Motion 11** | Page transitions, micro-animations |
| **Three.js** | 3D Aira avatar rendering |
| **face-api.js** | On-device facial emotion detection |
| **Recharts** | Mood trend visualization |
| **react-i18next** | Multilingual support (EN / HI) |
| **Supabase JS** | Client-side authentication |
| **Retell Client SDK** | WebRTC-based AI voice calls |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Data persistence (users, logs, meds, sentiments) |
| **Google Gemini AI** | Conversational AI + intent extraction |
| **Supabase Auth** | JWT-based authentication |
| **ElevenLabs** | High-quality text-to-speech |
| **AssemblyAI** | Speech-to-text transcription |
| **Retell AI** | AI-powered phone calls |
| **Twilio** | SMS + WhatsApp medication reminders |
| **Nodemailer** | Email notifications + GentleReach |
| **Socket.IO** | Real-time events |
| **sentiment (npm)** | NLP sentiment scoring + custom stress lexicon |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker + docker-compose** | Containerized deployment (API + MongoDB + Redis) |
| **helmet / cors / compression** | Production security hardening |
| **express-rate-limit** | API abuse protection |
| **morgan** | HTTP request logging |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** connection (Atlas or local)
- **Supabase** project with Email + Google Auth enabled
- API keys: **ElevenLabs**, **AssemblyAI**, **Google Gemini**
- Optional: **Twilio** (SMS/WhatsApp), **Retell AI** (voice calls)

### 1. Clone & Install

```bash
git clone https://github.com/prajwaledu802-coder/With_U.git
cd With_U

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

**`server/.env`**
```env
# Database
MONGO_URI=mongodb+srv://your-cluster-url

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
GEMINI_API_KEY=your-gemini-key

# Voice
ELEVENLABS_API_KEY=your-key
ELEVENLABS_VOICE_ID=your-voice-id
ELEVENLABS_MODEL_ID=eleven_monolingual_v1
ASSEMBLYAI_API_KEY=your-key

# Twilio (optional — SMS/WhatsApp reminders)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Retell AI (optional — voice calls)
RETELL_API_KEY=your-key

# Email (optional — GentleReach + medication reminders)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password

# Feature toggles
ENABLE_REAL_TTS=false
ENABLE_REAL_STT=false
ENABLE_REAL_EMAIL=false

CLIENT_URL=http://localhost:5173
PORT=5000
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev    # → http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev    # → http://localhost:5173
```

### 4. Supabase Configuration
- **Authentication → URL Configuration**: Add `http://localhost:5173` as Site URL
- **Redirect URLs**: Add `http://localhost:5173/dashboard`
- **Providers**: Enable Email + Google OAuth

### 5. Docker (Production)

```bash
cd server
docker-compose up --build    # API + MongoDB + Redis
```

---

## 📡 API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <supabase-access-token>`.

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/sync` | Sync Supabase user → MongoDB |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/auth/onboarding/complete` | Mark onboarding done |
| `DELETE` | `/auth/account` | Delete account |

</details>

<details>
<summary><strong>👤 Users</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/users/profile` | Update name, role, timezone |
| `GET` | `/users/settings` | Get user settings |
| `PUT` | `/users/settings` | Update theme, language, GentleReach prefs |

</details>

<details>
<summary><strong>🤖 AI Companion</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/companion/analyze-text` | Send message → get AI response + stress analysis |
| `POST` | `/aira/context` | Get user context for AI |

</details>

<details>
<summary><strong>💊 Medications</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/medications` | List all medications |
| `POST` | `/medications` | Add new medication |
| `PUT` | `/medications/:id` | Update medication |
| `DELETE` | `/medications/:id` | Remove medication |
| `POST` | `/medications/:id/taken` | Mark dose as taken |
| `POST` | `/medications/:id/remind` | Send reminder (WhatsApp + SMS + Email) |
| `POST` | `/medications/:id/resend-confirmation` | Resend email verification |

</details>

<details>
<summary><strong>📊 Sentiment & Mood</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sentiment/analyze` | Analyze raw text |
| `GET` | `/sentiment/history?days=14` | Daily sentiment history |
| `GET` | `/sentiment/trend` | Trend direction (worsening/improving/stable) |
| `POST` | `/mood/analyze` | Analyze facial emotion → stress score |

</details>

<details>
<summary><strong>🎙️ Voice</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/voice/tts` | Text → MP3 (ElevenLabs) |
| `POST` | `/voice/stt` | Audio → transcript (AssemblyAI) |
| `GET` | `/voice/voices` | List available TTS voices |

</details>

<details>
<summary><strong>📞 Calls</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/call/call-aira` | Initiate AI voice call (Retell) |
| `POST` | `/call/call-ai` | AI comfort call to user's phone |
| `POST` | `/call/call-contact` | Call a trusted contact |

</details>

<details>
<summary><strong>🤝 GentleReach & Contacts</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/contacts` | List trusted contacts |
| `POST` | `/contacts` | Add trusted contact |
| `PUT` | `/contacts/:id` | Update contact |
| `DELETE` | `/contacts/:id` | Remove contact |
| `POST` | `/gentlereach/toggle` | Enable/disable GentleReach |
| `POST` | `/gentlereach/trigger` | Manual nudge to contact |
| `GET` | `/gentlereach/history` | Past GentleReach events |

</details>

<details>
<summary><strong>📋 Dashboard & Resources</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Greeting, stress, trend, suggestions |
| `GET` | `/dashboard/stats` | Lifetime stats |
| `GET` | `/resources?lang=en` | Language-aware wellness resources |

</details>

---

## 🧠 How Stress Detection Works

WITH_U uses **invisible, multi-signal stress detection** that runs passively:

```
┌─────────────┐   ┌──────────────┐   ┌───────────────┐
│ Typing       │   │ Session      │   │ Facial        │
│ Patterns     │   │ Behavior     │   │ Expressions   │
│              │   │              │   │               │
│ • Hesitation │   │ • Duration   │   │ • face-api.js │
│ • Backspacing│   │ • Late-night │   │ • 7 emotions  │
│ • Pauses     │   │ • Screen time│   │ • Confidence  │
└──────┬───────┘   └──────┬───────┘   └───────┬───────┘
       │                  │                    │
       └─────────┬────────┘                    │
                 ▼                             │
        ┌────────────────┐                     │
        │ Composite      │◄────────────────────┘
        │ Stress Score   │
        │ (0-100)        │
        └────────┬───────┘
                 │
        ┌────────▼───────┐
        │ Stress Level   │
        │ low/moderate/  │
        │ high/critical  │
        └────────┬───────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌───────┐  ┌─────────┐  ┌───────────┐
│ Aira  │  │ Quick   │  │ Gentle    │
│ adapts│  │ Relief  │  │ Reach     │
│ tone  │  │ suggest │  │ triggers  │
└───────┘  └─────────┘  └───────────┘
```

### GentleReach Auto-Trigger Logic
1. User must have GentleReach **enabled**
2. Computes 7-day stress trend
3. Only fires if trend is **worsening** AND last 3 days all had `stressLevel ≥ 50`
4. Picks the primary trusted contact (or any with `notifyOnHighStress: true`)
5. Honors a **24-hour cooldown** between notifications
6. Sends a soft, non-clinical email in the user's language

---

## 🎨 Design Philosophy

| Principle | Implementation |
|---|---|
| **Never clinical** | No "depression", "diagnosis" — only soft phrases like "you've been carrying a lot" |
| **Passive, not pushy** | The system never demands input or pings the user |
| **Warm aesthetics** | Custom warm/sage color palette, glassmorphism cards, gradient accents |
| **Multilingual empathy** | Aira converses in 11 languages, UI supports EN/HI |
| **Privacy-first** | Camera feed stays on-device, no facial data uploaded |
| **Gentle micro-animations** | Framer Motion transitions, floating cards, pulse effects |

---

## 🌐 Supported Languages

| Language | Aira Conversation | UI |
|---|---|---|
| English | ✅ | ✅ |
| Hindi (हिन्दी) | ✅ | ✅ |
| Kannada (ಕನ್ನಡ) | ✅ | — |
| Tamil (தமிழ்) | ✅ | — |
| Telugu (తెలుగు) | ✅ | — |
| Malayalam (മലയാളം) | ✅ | — |
| Bengali (বাংলা) | ✅ | — |
| Marathi (मराठी) | ✅ | — |
| Gujarati (ગુજરાતી) | ✅ | — |
| Punjabi (ਪੰਜਾਬੀ) | ✅ | — |
| Urdu (اردو) | ✅ | — |

---

## 🐳 Deployment

### Docker Compose (recommended)
```bash
cd server
docker-compose up --build -d
```

This spins up:
- **aira-api** — Node.js backend on port `5000`
- **aira-mongo** — MongoDB 7 on port `27017`
- **aira-redis** — Redis 7 on port `6379`

### Manual
```bash
# Build frontend
cd client && npm run build

# Start backend
cd ../server && NODE_ENV=production node server.js
```

---

## 📁 Database Models

| Model | Purpose |
|---|---|
| `User` | Profiles, settings, onboarding state |
| `Log` | Journal entries with sentiment scores |
| `Sentiment` | Daily aggregate stress/mood metrics |
| `Medication` | Medication details, schedules, streaks |
| `Routine` | Daily routine tracking |
| `TrustedContact` | Emergency contacts for GentleReach |
| `GentleReachEvent` | Outreach history log |
| `ChatSession` | Conversation sessions with Aira |
| `Conversation` | v2 conversation threads |
| `Emotion` | Detected emotion records |
| `Stress` | Stress measurement records |
| `Session` | User session tracking |
| `Activity` | User activity log |

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with 💜 for those who care for others</strong>
  <br />
  <em>Because caregivers deserve someone quietly looking out for them too.</em>
</p>
