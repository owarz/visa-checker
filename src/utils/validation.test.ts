import {
  ValidationError,
  validateRequiredEnvVars,
  validateTelegramChannelId,
  parseCommaSeparatedString,
  parseNumericEnvVar,
  parseBooleanEnvVar,
} from './validation';

describe('Validation utilities', () => {
  describe('ValidationError', () => {
    it('should create error with correct name and message', () => {
      const error = new ValidationError('Test error');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test error');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('validateRequiredEnvVars', () => {
    it('should not throw for valid environment variables', () => {
      expect(() => {
        validateRequiredEnvVars({
          VAR1: 'value1',
          VAR2: 'value2',
        });
      }).not.toThrow();
    });

    it('should throw ValidationError for missing variables', () => {
      expect(() => {
        validateRequiredEnvVars({
          VAR1: 'value1',
          VAR2: undefined,
          VAR3: '',
        });
      }).toThrow(ValidationError);
    });

    it('should include missing variable names in error message', () => {
      expect(() => {
        validateRequiredEnvVars({
          VAR1: undefined,
          VAR2: '',
          VAR3: 'value3',
        });
      }).toThrow('Missing required environment variables: VAR1, VAR2');
    });
  });

  describe('validateTelegramChannelId', () => {
    it('should not throw for valid channel ID', () => {
      expect(() => {
        validateTelegramChannelId('-1001234567890');
      }).not.toThrow();
    });

    it('should not throw for positive channel ID', () => {
      expect(() => {
        validateTelegramChannelId('1234567890');
      }).not.toThrow();
    });

    it('should throw for invalid format', () => {
      expect(() => {
        validateTelegramChannelId('invalid');
      }).toThrow(ValidationError);
    });

    it('should throw for undefined', () => {
      expect(() => {
        validateTelegramChannelId(undefined);
      }).toThrow(ValidationError);
    });
  });

  describe('parseCommaSeparatedString', () => {
    it('should parse comma-separated values', () => {
      const result = parseCommaSeparatedString('value1,value2,value3');
      expect(result).toEqual(['value1', 'value2', 'value3']);
    });

    it('should trim whitespace', () => {
      const result = parseCommaSeparatedString(' value1 , value2 , value3 ');
      expect(result).toEqual(['value1', 'value2', 'value3']);
    });

    it('should return empty array for undefined', () => {
      const result = parseCommaSeparatedString(undefined);
      expect(result).toEqual([]);
    });

    it('should filter empty values', () => {
      const result = parseCommaSeparatedString('value1,,value2,');
      expect(result).toEqual(['value1', 'value2']);
    });
  });

  describe('parseNumericEnvVar', () => {
    it('should parse valid number', () => {
      const result = parseNumericEnvVar('42', 0);
      expect(result).toBe(42);
    });

    it('should return default for invalid number', () => {
      const result = parseNumericEnvVar('invalid', 10);
      expect(result).toBe(10);
    });

    it('should return default for undefined', () => {
      const result = parseNumericEnvVar(undefined, 5);
      expect(result).toBe(5);
    });

    it('should handle negative numbers', () => {
      const result = parseNumericEnvVar('-42', 0);
      expect(result).toBe(-42);
    });

    it('should handle float numbers', () => {
      const result = parseNumericEnvVar('3.14', 0);
      expect(result).toBe(3.14);
    });
  });

  describe('parseBooleanEnvVar', () => {
    it('should return true for "true"', () => {
      const result = parseBooleanEnvVar('true');
      expect(result).toBe(true);
    });

    it('should return false for "false"', () => {
      const result = parseBooleanEnvVar('false');
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = parseBooleanEnvVar(undefined);
      expect(result).toBe(false);
    });

    it('should return false for other values', () => {
      expect(parseBooleanEnvVar('yes')).toBe(false);
      expect(parseBooleanEnvVar('1')).toBe(false);
      expect(parseBooleanEnvVar('TRUE')).toBe(false);
    });
  });
});