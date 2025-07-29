/**
 * Application constants
 */
export const DEFAULT_VALUES = {
  CHECK_INTERVAL: '*/5 * * * *',
  TARGET_COUNTRY: 'tur',
  MISSION_COUNTRIES: ['nld'],
  VISA_API_URL: 'https://api.visasbot.com/api/visa/list',
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000,
  MAX_CACHE_SIZE: 1000,
  CACHE_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  TELEGRAM_RATE_LIMIT: 15,
  TELEGRAM_RETRY_AFTER: 5000,
} as const;

/**
 * Valid appointment statuses that should trigger notifications
 */
export const VALID_APPOINTMENT_STATUSES = ['open', 'waitlist_open'] as const;

/**
 * Status emoji mapping for notifications
 */
export const STATUS_EMOJI = {
  open: '✅',
  waitlist_open: '⏳',
  closed: '❌',
  waitlist_closed: '🔒',
} as const;