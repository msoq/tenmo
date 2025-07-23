import { useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { PhraseSettings } from '@/components/phrase-settings';

const PHRASE_SETTINGS_API_KEY = '/api/phrase/settings';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUserPhrasesSettings() {
  const { mutate } = useSWRConfig();
  const {
    data: settings,
    error,
    isLoading,
  } = useSWR<PhraseSettings | null>(PHRASE_SETTINGS_API_KEY, fetcher);

  const createSettings = useCallback(
    async (newSettings: PhraseSettings): Promise<PhraseSettings> => {
      const response = await fetch(PHRASE_SETTINGS_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create settings');
      }

      const created = await response.json();
      mutate(PHRASE_SETTINGS_API_KEY, created, false);
      return created;
    },
    [mutate],
  );

  const updateSettings = useCallback(
    async (newSettings: PhraseSettings): Promise<PhraseSettings> => {
      // Optimistic update
      mutate(PHRASE_SETTINGS_API_KEY, newSettings, false);

      try {
        const response = await fetch(PHRASE_SETTINGS_API_KEY, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSettings),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update settings');
        }

        const updated = await response.json();
        mutate(PHRASE_SETTINGS_API_KEY, updated, false);
        return updated;
      } catch (error) {
        // Revert optimistic update on error
        mutate(PHRASE_SETTINGS_API_KEY);
        throw error;
      }
    },
    [settings, mutate],
  );

  const saveSettings = useCallback(
    async (newSettings: PhraseSettings): Promise<PhraseSettings> => {
      // Auto-detect whether to create or update
      if (settings === null) {
        return createSettings(newSettings);
      } else {
        return updateSettings(newSettings);
      }
    },
    [settings, createSettings, updateSettings],
  );

  return {
    settings,
    saveSettings,
    isLoading,
    error,
  };
}
