import ISO6391 from 'iso-639-1';

/**
 * Converts a language code to the English language name
 * @param code - ISO 639-1 language code (e.g., 'en', 'es')
 * @returns English language name (e.g., 'English', 'Spanish')
 */
export function getLanguageNameFromCode(code: string): string {
  const name = ISO6391.getName(code);
  return name || code; // fallback to code if not found
}

/**
 * Converts a language name to ISO 639-1 language code
 * @param name - English language name (e.g., 'English', 'Spanish')
 * @returns ISO 639-1 language code (e.g., 'en', 'es')
 */
export function getLanguageCodeFromName(name: string): string {
  const code = ISO6391.getCode(name);
  return code || name; // fallback to name if not found
}

/**
 * Checks if a given string is a valid ISO 639-1 language code
 * @param value - String to check
 * @returns true if it's a valid language code
 */
export function isLanguageCode(value: string): boolean {
  return ISO6391.validate(value);
}

/**
 * Normalizes language value - if it's a code, convert to name; if it's already a name, return as-is
 * This is useful for backward compatibility when migrating from names to codes
 * @param value - Language code or name
 * @returns English language name
 */
export function normalizeLanguageToName(value: string): string {
  if (!value) return value;
  
  // If it's a valid language code, convert to name
  if (isLanguageCode(value)) {
    return getLanguageNameFromCode(value);
  }
  
  // Otherwise, assume it's already a name
  return value;
}

/**
 * Normalizes language value - if it's a name, convert to code; if it's already a code, return as-is
 * This is useful for ensuring consistent storage format
 * @param value - Language code or name
 * @returns ISO 639-1 language code
 */
export function normalizeLanguageToCode(value: string): string {
  if (!value) return value;
  
  // If it's already a valid language code, return as-is
  if (isLanguageCode(value)) {
    return value;
  }
  
  // Otherwise, try to convert from name to code
  return getLanguageCodeFromName(value);
}