'use client';

import { useEffect } from 'react';
import { PhrasesList } from '@/components/phrases-list';
import { usePhrases } from '@/hooks/use-phrases';
import { useUserPhrasesSettings } from '@/hooks/use-user-phrases-settings';

export default function Page() {
  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useUserPhrasesSettings();

  const {
    phrases,
    error: phrasesError,
    isLoading: phrasesLoading,
    getPhrases,
    submitTranslation,
  } = usePhrases(settings);

  // get phrases when settings are loaded
  useEffect(() => {
    if (settings && !settingsLoading) {
      getPhrases();
    }
  }, [settings, settingsLoading, getPhrases]);

  return (
    <PhrasesList
      phrases={phrases}
      isLoading={settingsLoading || phrasesLoading}
      error={settingsError || phrasesError}
      onSubmitTranslation={submitTranslation}
    />
  );
}
