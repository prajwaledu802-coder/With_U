const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

/* ── Routes ── */
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const routineRoutes = require('./routes/routineRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const airaRoutes = require('./routes/airaRoutes');
const companionRoutes = require('./routes/companionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const gentleReachRoutes = require('./routes/gentleReachRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const toolRoutes = require('./routes/toolRoutes');
const logRoutes = require('./routes/logRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const pausePlayRoutes = require('./routes/pausePlayRoutes');
const chatSessionRoutes = require('./routes/chatSessionRoutes');
const smsRoutes = require('./routes/smsRoutes');
const callRoutes = require('./routes/call.routes');
const moodRoutes = require('./routes/moodRoutes');
const v2Router = require('./routes/index');

const app = express();

/* ── Middleware ── */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Check exact match
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any Vercel preview/deploy URL for this project
      if (origin.includes('vercel.app')) return callback(null, true);
      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
      // Block everything else
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ── Health ── */
app.get('/', (_req, res) => {
  res.json({
    name: 'WITH_U API',
    version: '2.0.0',
    status: 'ok',
    features: ['companion', 'quick-relief', 'medications', 'routines', 'notifications'],
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/* ── API Routes (rate-limited) ── */
app.use('/api', apiLimiter);

// Core 3 features
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/notify', notificationRoutes);
app.use('/api/aira', airaRoutes);

// Supporting features
app.use('/api/users', userRoutes);
app.use('/api/companion', companionRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/gentlereach', gentleReachRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tool', toolRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/pause-play', pausePlayRoutes);
app.use('/api/sessions', chatSessionRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/call', callRoutes);
app.use('/api/mood', moodRoutes);

// v2 — clean module-per-route layout
app.use('/api/v2', v2Router);

/* ── Error handling ── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
