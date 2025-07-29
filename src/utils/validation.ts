/**
 * Validation utility functions
 */

/**
 * Validation error class for better error handling
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that required environment variables are present
 * @param envVars Object with variable names and their values
 * @throws ValidationError if any required variables are missing
 */
export function validateRequiredEnvVars(
  envVars: Record<string, string | undefined>
): void {
  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new ValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Validates Telegram channel ID format
 * @param channelId The channel ID to validate
 * @throws ValidationError if the format is invalid
 */
export function validateTelegramChannelId(
  channelId: string | undefined
): asserts channelId is string {
  if (!channelId || !/^-?\d+$/.test(channelId)) {
    throw new ValidationError('Invalid TELEGRAM_CHAT_ID format');
  }
}

/**
 * Safely parses a comma-separated string into an array
 * @param value The string to parse
 * @returns Array of trimmed strings
 */
export function parseCommaSeparatedString(value: string | undefined): string[] {
  return value
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
}

/**
 * Safely parses a numeric environment variable
 * @param value The string value to parse
 * @param defaultValue The default value if parsing fails
 * @returns The parsed number or default value
 */
export function parseNumericEnvVar(
  value: string | undefined,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validates boolean environment variable
 * @param value The string value to parse
 * @returns Boolean value
 */
export function parseBooleanEnvVar(value: string | undefined): boolean {
  return value === 'true';
}