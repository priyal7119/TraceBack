/**
 * Safe Application Logger
 * Prevents leaking secrets, tokens, or sensitive information into stdout/logs.
 */

const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;
  const clone = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'authorization', 'cookie', 'credentials'];

  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitize(clone[key]);
    }
  }
  return clone;
};

module.exports = {
  info: (message, meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? sanitize(meta) : '');
  },
  warn: (message, meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? sanitize(meta) : '');
  },
  error: (message, err) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, err?.message || err);
  },
  sanitize
};
