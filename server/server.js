require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startScheduler } = require('./src/services/schedulerService');
const ws = require('./src/websocket/socket');
const stressJob = require('./src/jobs/stress.job');
const notificationJob = require('./src/jobs/notification.job');
const analyticsJob = require('./src/jobs/analytics.job');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

(async () => {
  try {
    await connectDB();
    startScheduler();
    stressJob.start();
    notificationJob.start();
    analyticsJob.start();
  } catch (err) {
    logger.warn('MongoDB connection failed – server will start without DB:', err.message);
  }

  ws.attach(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Aira server running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`Websocket gateway: ws://localhost:${PORT}`);
  });
})();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
