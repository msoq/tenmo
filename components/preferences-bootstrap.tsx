'use client';

import { useUserPreferences } from '@/hooks/use-user-preferences';

export function PreferencesBootstrap() {
  // Trigger SWR fetch early to hydrate cache app-wide
  useUserPreferences();
  return null;
}
