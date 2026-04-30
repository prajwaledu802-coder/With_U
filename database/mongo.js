/**
 * Standalone Mongo connector — used by scripts/seeders that need to talk to
 * the database outside of the Express runtime. The runtime path is still
 * /server/src/config/db.js.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env') });

const connect = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    retryWrites: true,
    w: 'majority',
  });
};

const disconnect = async () => mongoose.disconnect();

module.exports = { connect, disconnect, mongoose };
