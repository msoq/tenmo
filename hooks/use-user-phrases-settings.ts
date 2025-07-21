import { useCallback } from 'react';
import useSWR from 'swr';
import type { PhraseParams } from '@/components/phrase-settings';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUserPhrasesSettings() {
  const { data: settings, mutate, error, isLoading } = useSWR<PhraseParams | null>(
    '/api/phrase/settings',
    fetcher
  );

  const createSettings = useCallback(
    async (newSettings: PhraseParams): Promise<PhraseParams> => {
      const response = await fetch('/api/phrase/settings', {
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
      mutate(created, false);
      return created;
    },
    [mutate]
  );

  const updateSettings = useCallback(
    async (newSettings: PhraseParams): Promise<PhraseParams> => {
      // Optimistic update
      mutate(newSettings, false);

      try {
        const response = await fetch('/api/phrase/settings', {
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
        mutate(updated, false);
        return updated;
      } catch (error) {
        // Revert optimistic update on error
        mutate();
        throw error;
      }
    },
    [settings, mutate]
  );

  const saveSettings = useCallback(
    async (newSettings: PhraseParams): Promise<PhraseParams> => {
      // Auto-detect whether to create or update
      if (settings === null) {
        return createSettings(newSettings);
      } else {
        return updateSettings(newSettings);
      }
    },
    [settings, createSettings, updateSettings]
  );

  return {
    settings,
    createSettings,
    updateSettings,
    saveSettings,
    isLoading: isLoading || (!settings && !error),
    needsSetup: settings === null && !error && !isLoading,
    error,
  };
}