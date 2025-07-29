/**
 * @fileoverview City extraction utility
 * Provides functionality to extract city names from appointment center names
 */

/**
 * Extracts city name from appointment center name
 * 
 * Supports various formats commonly used in visa application centers:
 * - "Netherlands Visa Application Centre - Antalya" -> "Antalya"
 * - "Bulgaria Visa Application Center, Ankara" -> "Ankara"
 * - "Netherlands Visa application center- Dubai" -> "Dubai"
 * 
 * @param centerName The full name of the visa application center
 * @returns Extracted city name, or original center name if no pattern matches
 * 
 * @example
 * ```typescript
 * extractCity("Netherlands Visa Application Centre - Istanbul");
 * // Returns: "Istanbul"
 * 
 * extractCity("Bulgaria Visa Application Center, Ankara");
 * // Returns: "Ankara"
 * ```
 */
export function extractCity(centerName: string): string {
  // Tire veya virgülle ayrılmış son kelime grubunu yakala
  // Allows spaces in the city name
  const match = centerName.match(/(?:-|\s*,\s*)\s*([^-,]+)$/);
  return match ? match[1].trim() : centerName;
}
