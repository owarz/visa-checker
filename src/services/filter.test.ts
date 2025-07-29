import { AppointmentFilterService } from './filter';
import type { VisaAppointment } from '../types';

// Set test environment variables before importing modules that validate them
process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = 'test_token';
process.env.TELEGRAM_CHAT_ID = '-1001234567890';

// Mock the config module
jest.mock('../config/environment', () => ({
  config: {
    app: {
      targetCountry: 'tur',
      missionCountries: ['nld', 'fra'],
      targetCities: ['istanbul', 'ankara'],
      targetSubCategories: ['tourism', 'business'],
      debug: false,
    },
  },
}));

// Mock the cityExtractor
jest.mock('../core/cityExtractor', () => ({
  extractCity: jest.fn((center: string) => {
    if (center.includes('Istanbul')) return 'Istanbul';
    if (center.includes('Ankara')) return 'Ankara';
    return 'Unknown';
  }),
}));

describe('AppointmentFilterService', () => {
  let filterService: AppointmentFilterService;
  
  beforeEach(() => {
    filterService = new AppointmentFilterService();
  });

  const createMockAppointment = (overrides: Partial<VisaAppointment> = {}): VisaAppointment => ({
    id: 1,
    tracking_count: 10,
    country_code: 'tur',
    mission_code: 'nld',
    visa_category: 'SHORT TERM VISA',
    visa_type: 'TOURISM VISA APPLICATION',
    center: 'Netherlands Visa Application Centre - Istanbul',
    status: 'open',
    last_checked_at: new Date().toISOString(),
    ...overrides,
  });

  describe('isAppointmentValid', () => {
    it('should return true for valid appointment', () => {
      const appointment = createMockAppointment();
      expect(filterService.isAppointmentValid(appointment)).toBe(true);
    });

    it('should return false for invalid status', () => {
      const appointment = createMockAppointment({ status: 'closed' });
      expect(filterService.isAppointmentValid(appointment)).toBe(false);
    });

    it('should return false for wrong country', () => {
      const appointment = createMockAppointment({ country_code: 'gbr' });
      expect(filterService.isAppointmentValid(appointment)).toBe(false);
    });

    it('should return false for wrong mission country', () => {
      const appointment = createMockAppointment({ mission_code: 'deu' });
      expect(filterService.isAppointmentValid(appointment)).toBe(false);
    });

    it('should return false for wrong city', () => {
      const appointment = createMockAppointment({ 
        center: 'Netherlands Visa Application Centre - Izmir' 
      });
      expect(filterService.isAppointmentValid(appointment)).toBe(false);
    });

    it('should return false for wrong visa type', () => {
      const appointment = createMockAppointment({ visa_type: 'STUDY VISA APPLICATION' });
      expect(filterService.isAppointmentValid(appointment)).toBe(false);
    });

    it('should return true for waitlist_open status', () => {
      const appointment = createMockAppointment({ status: 'waitlist_open' });
      expect(filterService.isAppointmentValid(appointment)).toBe(true);
    });
  });
});