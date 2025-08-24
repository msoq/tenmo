import type { PhraseSettings } from '@/components/phrase-settings-dialog';
import { useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const PHRASE_SETTINGS_API_KEY = '/api/phrases/settings';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

async function createSettingsMutation(
  url: string,
  { arg }: { arg: PhraseSettings },
): Promise<PhraseSettings> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create settings');
  }

  return response.json();
}

async function updateSettingsMutation(
  url: string,
  { arg }: { arg: PhraseSettings },
): Promise<PhraseSettings> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }

  return response.json();
}

export function useUserPhrasesSettings() {
  const {
    data: settings,
    error,
    isLoading,
    mutate,
  } = useSWR<PhraseSettings | null>(PHRASE_SETTINGS_API_KEY, fetcher);

  const { trigger: triggerCreate } = useSWRMutation(
    PHRASE_SETTINGS_API_KEY,
    createSettingsMutation,
    {
      populateCache: true,
      revalidate: false,
    },
  );

  const { trigger: triggerUpdate } = useSWRMutation(
    PHRASE_SETTINGS_API_KEY,
    updateSettingsMutation,
    {
      populateCache: true,
      revalidate: false,
      rollbackOnError: true,
    },
  );

  const saveSettings = useCallback(
    async (newSettings: PhraseSettings): Promise<PhraseSettings> => {
      // Auto-detect whether to create or update
      if (settings === null) {
        return await triggerCreate(newSettings);
      } else {
        // Optimistic update
        mutate(newSettings, false);

        try {
          const result = await triggerUpdate(newSettings);
          return result;
        } catch (error) {
          // Revert on error
          await mutate();
          throw error;
        }
      }
    },
    [settings, triggerCreate, triggerUpdate, mutate],
  );

  return {
    settings,
    saveSettings,
    isLoading,
    error,
  };
}
