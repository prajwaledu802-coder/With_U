const { verifySupabaseToken } = require('../config/supabase');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new ApiError(401, 'Authentication required');

  let supabaseUser;
  try {
    supabaseUser = await verifySupabaseToken(token);
  } catch (err) {
    logger.warn('Token verification failed:', err.message);
    throw new ApiError(401, 'Invalid or expired token');
  }

  const supabaseId = supabaseUser.id || supabaseUser.sub;
  const email = supabaseUser.email;

  if (!supabaseId || !email) throw new ApiError(401, 'Malformed token payload');

  let user = await User.findOne({ supabaseId });
  if (!user) {
    user = await User.create({
      supabaseId,
      email,
      name: supabaseUser.user_metadata?.full_name || email.split('@')[0],
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    });
    logger.info(`Auto-created user record for ${email}`);
  }

  req.user = user;
  req.supabaseUser = supabaseUser;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const supabaseUser = await verifySupabaseToken(token);
    const supabaseId = supabaseUser.id || supabaseUser.sub;
    if (supabaseId) {
      req.user = await User.findOne({ supabaseId });
      req.supabaseUser = supabaseUser;
    }
  } catch {}
  next();
});

module.exports = { protect, optionalAuth };
