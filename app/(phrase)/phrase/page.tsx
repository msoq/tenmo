'use client';

import { useState } from 'react';
import { PhrasesList } from '@/components/phrases-list';
import type { PhraseParams } from '@/components/phrase-settings';
import { usePhrases } from '@/hooks/use-phrases';

const defaultParams: PhraseParams = {
  from: 'Spanish',
  to: 'English',
  topic: 'travel',
  count: 10,
  instruction: 'None',
  level: 'B1',
  phraseLength: 5,
};

export default function Page() {
  const [params, setParams] = useState<PhraseParams>(defaultParams);
  const { phrases, error, isLoading, updateTranslation, submitTranslation, regenerate } = usePhrases(params);


  return (
    <PhrasesList
      phrases={phrases}
      params={params}
      onParamsChange={setParams}
      onRepeat={regenerate}
      isLoading={isLoading}
      error={error}
      onTranslationChange={updateTranslation}
      onSubmitTranslation={submitTranslation}
    />
  );
}
