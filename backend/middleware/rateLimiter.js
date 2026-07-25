import rateLimit from 'express-rate-limit';

// Helper for standard 429 JSON error response
const createLimiterResponse = (message) => ({
  error: 'RATE_LIMIT_EXCEEDED',
  message: message || 'Too many requests from this IP. Please try again later.'
});

// 1. General API Rate Limiter (100 requests per 15 minutes per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: createLimiterResponse('API request limit reached. Please wait a few minutes before retrying.')
});

// 2. Authentication Rate Limiter (20 requests per 15 minutes per IP per Section 8 security)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts (login, signup, password OTP) per window
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Too many authentication attempts from this IP. For security reasons, please try again after 15 minutes.')
});

// 3. Link Shortening Creation Limiter (50 links per 1 hour per IP)
export const linkCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // Limit each IP to 60 link creation requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Hourly link creation limit reached. Please upgrade to Core for higher throughput or wait an hour.')
});

// 4. High-Throughput Redirect Route Limiter (500 redirects per 1 minute per IP to block scraper bots while keeping normal traffic instant)
export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // Limit each IP to 600 redirect lookups per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('High-frequency redirect threshold exceeded. Please slow down requests.')
});

export default {
  apiLimiter,
  authLimiter,
  linkCreationLimiter,
  redirectLimiter
};
