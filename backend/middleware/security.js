import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

/**
 * Global API Rate Limiter
 * 150 requests per 15-minute window per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250, // 250 req / 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Strict Authentication & OTP Rate Limiter
 * 15 attempts per 15-minute window
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login or OTP verification attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Helmet Security Headers Configuration
 */
export const helmetGuard = helmet({
  contentSecurityPolicy: false, // Disabled to allow cross-origin embed widget loading
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

/**
 * HTTP Parameter Pollution Protection
 */
export const hppGuard = hpp();

/**
 * Custom Lightweight Payload Sanitizer Middleware
 * Cleans potential injection characters while preserving valid text and media
 */
export function sanitizePayloads(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj) {
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
