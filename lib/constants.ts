import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

// Topic-related constants
export const PROFICIENCY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];

export const LEVEL_COLORS = {
  A1: 'bg-green-100 text-green-800 border-green-200',
  A2: 'bg-green-100 text-green-800 border-green-200',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  B2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  C1: 'bg-red-100 text-red-800 border-red-200',
  C2: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const LEVEL_DESCRIPTIONS = {
  A1: 'Beginner - Basic words and phrases',
  A2: 'Elementary - Simple conversations',
  B1: 'Intermediate - Complex topics',
  B2: 'Upper Intermediate - Detailed discussions',
  C1: 'Advanced - Complex abstract topics',
  C2: 'Proficient - Native-like fluency',
} as const;

export const LEVEL_OPTIONS = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficient' },
] as const;