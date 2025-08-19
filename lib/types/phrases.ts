/**
 * Type definitions for the phrases feature
 *
 * This file provides a clean separation between:
 * - Database models (what comes from DB)
 * - Domain models (internal application models with enriched data)
 * - API DTOs (what gets sent to/from the frontend)
 */

// API DTO - What the frontend expects and sends
export interface PhraseSettingsDTO {
  from: string;
  to: string;
  topics: string[]; // Array of topic IDs
  count: number;
  instruction: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  phraseLength: number;
}

// You can also create more specific DTOs if needed
export interface PhraseSettingsCreateDTO extends PhraseSettingsDTO {}
export interface PhraseSettingsUpdateDTO extends Partial<PhraseSettingsDTO> {}

// Response types for API endpoints
export interface PhraseSettingsResponse extends PhraseSettingsDTO {}

export interface PhrasesGenerateResponse {
  phrases: Array<{
    original: string;
    translation: string;
    notes?: string;
  }>;
}
