import { checkAppointments } from './appointmentChecker';

// Mock the config module to prevent process.exit and provide dummy values
jest.mock('../config/environment', () => ({
  config: {
    app: {
      checkInterval: '*',
      targetCountry: 'all',
      missionCountries: ['nld'],
      targetCities: [],
      targetSubCategories: [],
      debug: false,
    },
    telegram: {
      botToken: 'dummy_token',
      chatId: 'dummy_chat_id',
    },
  },
}));

// Mock the cache service
jest.mock('../services/cache', () => ({
  cacheService: {
    startCleanupInterval: jest.fn(),
    createKey: jest.fn((appointment) => `key-${appointment.id}`),
    has: jest.fn(() => false),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the API service
jest.mock('../services/api', () => ({
  fetchAppointments: jest.fn(() => Promise.resolve([])), // Return an empty array by default
}));

// Mock the Telegram service
jest.mock('../services/telegram', () => ({
  telegramService: {
    sendNotification: jest.fn(() => Promise.resolve(true)),
  },
}));

// Mock the cityExtractor (if needed, for now just a basic mock)
jest.mock('./cityExtractor', () => ({
  extractCity: jest.fn((center) => center.split(',')[0]),
}));

describe('Appointment Checker', () => {
  it('should have a checkAppointments function', () => {
    expect(checkAppointments).toBeDefined();
  });
});