const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        tls: true,
        tlsAllowInvalidCertificates: false,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        heartbeatFrequencyMS: 10000,
      });
      logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      mongoose.connection.on('error', (err) => logger.error('Mongo error:', err.message));
      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongo disconnected — mongoose will auto-reconnect');
      });
      mongoose.connection.on('reconnected', () => {
        logger.info('Mongo reconnected');
      });
      return conn;
    } catch (err) {
      logger.warn(`MongoDB connect attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }
  }
  throw new Error(`MongoDB connection failed after ${MAX_RETRIES} attempts`);
};

module.exports = connectDB;
