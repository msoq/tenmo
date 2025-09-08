'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

export interface UserPreferencesDTO {
  from: string; // ISO 639-1 code
  to: string; // ISO 639-1 code
}

const KEY = '/api/preferences';

const fetcher = async (url: string): Promise<UserPreferencesDTO | null> => {
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as UserPreferencesDTO | null;
};

async function updatePrefs(
  url: string,
  { arg }: { arg: UserPreferencesDTO },
): Promise<UserPreferencesDTO> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    console.error('Failed to update preferences', res);
    const error = await res.text();
    throw new Error(error || 'Failed to update preferences');
  }
  return (await res.json()) as UserPreferencesDTO;
}

export function useUserPreferences() {
  const {
    data: prefs,
    error,
    isLoading,
    mutate,
  } = useSWR<UserPreferencesDTO | null>(KEY, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
  });

  const { trigger } = useSWRMutation(KEY, updatePrefs, {
    populateCache: true,
    revalidate: false,
  });

  async function setActiveLanguagePair(next: UserPreferencesDTO) {
    await mutate(next, false);
    try {
      const saved = await trigger(next);
      return saved;
    } catch (e) {
      await mutate();
      throw e;
    }
  }

  return { prefs, setActiveLanguagePair, isLoading, error };
}
