import dotenv from "dotenv";
import { DEFAULT_VALUES } from "../utils/constants";
import {
  validateRequiredEnvVars,
  validateTelegramChannelId,
  parseCommaSeparatedString,
  parseNumericEnvVar,
  parseBooleanEnvVar,
  ValidationError,
} from "../utils/validation";

dotenv.config();

/**
 * Çevre değişkenleri için tip tanımlamaları
 */
export interface EnvironmentConfig {
  // Telegram ile ilgili yapılandırmalar
  telegram: {
    botToken: string; // Telegram bot token'ı
    channelId: string; // Telegram kanal ID'si
    rateLimit: number; // Dakikada gönderilebilecek maksimum mesaj sayısı
    retryAfter: number; // Rate limit aşıldığında beklenecek süre (ms)
  };
  // Uygulama genel yapılandırmaları
  app: {
    checkInterval: string; // Kontrol sıklığı (cron formatında)
    targetCountry: string; // Kaynak ülke (Turkiye)
    targetCities: string[]; // Takip edilecek şehirler listesi
    missionCountries: string[]; // Hedef ülkeler listesi
    targetSubCategories: string[]; // Takip edilecek subkategoriler listesi
    debug: boolean; // Hata ayıklama modu
  };
  // API ile ilgili yapılandırmalar
  api: {
    visaApiUrl: string; // Vize API'sinin adresi
    maxRetries: number; // Maksimum deneme sayısı
    retryDelayBase: number; // Denemeler arası bekleme süresi (ms)
  };
  // Önbellek yapılandırmaları
  cache: {
    maxSize: number; // Maksimum önbellek boyutu
    cleanupInterval: number; // Temizleme sıklığı (ms)
  };
}

/**
 * Validates environment variables and creates configuration object
 * @returns Validated configuration object
 * @throws ValidationError for missing or invalid configuration
 */
function validateEnvironment(): EnvironmentConfig {
  try {
    // Validate required environment variables
    validateRequiredEnvVars({
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    });

    // Validate Telegram channel ID format
    validateTelegramChannelId(process.env.TELEGRAM_CHAT_ID);

    // Parse environment variables with defaults
    const cities = parseCommaSeparatedString(process.env.CITIES);
    const missionCountries = parseCommaSeparatedString(process.env.MISSION_COUNTRY);
    const subCategories = parseCommaSeparatedString(process.env.VISA_SUBCATEGORIES);

    // Use default mission countries if none specified
    const finalMissionCountries = missionCountries.length > 0
      ? missionCountries.map((country) => country.toLowerCase())
      : [...DEFAULT_VALUES.MISSION_COUNTRIES];

    // Build and return configuration object
    return {
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN!,
        channelId: process.env.TELEGRAM_CHAT_ID,
        rateLimit: parseNumericEnvVar(
          process.env.TELEGRAM_RATE_LIMIT_MINUTES,
          DEFAULT_VALUES.TELEGRAM_RATE_LIMIT
        ),
        retryAfter: parseNumericEnvVar(
          process.env.TELEGRAM_RETRY_AFTER,
          DEFAULT_VALUES.TELEGRAM_RETRY_AFTER
        ),
      },
      app: {
        checkInterval: process.env.CHECK_INTERVAL || DEFAULT_VALUES.CHECK_INTERVAL,
        targetCountry: process.env.TARGET_COUNTRY?.toLowerCase() || DEFAULT_VALUES.TARGET_COUNTRY,
        targetCities: cities,
        missionCountries: finalMissionCountries,
        targetSubCategories: subCategories,
        debug: parseBooleanEnvVar(process.env.DEBUG),
      },
      api: {
        visaApiUrl: process.env.VISA_API_URL || DEFAULT_VALUES.VISA_API_URL,
        maxRetries: parseNumericEnvVar(process.env.MAX_RETRIES, DEFAULT_VALUES.MAX_RETRIES),
        retryDelayBase: parseNumericEnvVar(
          process.env.RETRY_DELAY_BASE,
          DEFAULT_VALUES.RETRY_DELAY_BASE
        ),
      },
      cache: {
        maxSize: parseNumericEnvVar(process.env.MAX_CACHE_SIZE, DEFAULT_VALUES.MAX_CACHE_SIZE),
        cleanupInterval: parseNumericEnvVar(
          process.env.CACHE_CLEANUP_INTERVAL,
          DEFAULT_VALUES.CACHE_CLEANUP_INTERVAL
        ),
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Configuration error: ${error.message}`);
    } else {
      console.error('Unexpected configuration error:', error);
    }
    
    // Only exit in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    
    // In test environment, throw the error to be handled by the test framework
    throw error;
  }
}

// Yapılandırma nesnesini oluştur ve dışa aktar
export const config = validateEnvironment();
