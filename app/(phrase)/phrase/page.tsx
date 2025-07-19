'use client';

import { useEffect, useState } from 'react';
import { PhrasesList } from '@/components/phrases-list';
import type { PhraseParams } from '@/components/phrase-settings';

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
  const [phrases, setPhrases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhrases = async (phraseParams: PhraseParams) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to generate phrases
      const response = await fetch('/api/phrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phraseParams),
      });

      if (!response.ok) {
        throw new Error('Failed to generate phrases');
      }

      const data = await response.json();
      setPhrases(data.phrases);
    } catch (error) {
      console.error('Error fetching phrases:', error);
      setError('Failed to generate phrases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepeat = () => {
    fetchPhrases(params);
  };

  useEffect(() => {
    fetchPhrases(params);
  }, []);

  return (
    <PhrasesList
      phrases={phrases}
      params={params}
      onParamsChange={setParams}
      onRepeat={handleRepeat}
      isLoading={isLoading}
      error={error}
    />
  );
}
