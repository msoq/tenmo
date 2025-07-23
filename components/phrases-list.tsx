'use client';

import type { Phrase as PhraseType } from '@/components/phrase-settings-dialog';

interface PhrasesListProps {
  phrases: PhraseType[];
  isLoading?: boolean;
  error?: string | null;
}

export function PhrasesList({
  phrases,
  isLoading = false,
  error,
}: PhrasesListProps) {
  return (
    <div>
      {phrases.map((phrase, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: accepted
        <div key={index}>{phrase.text}</div>
      ))}
    </div>
  );
}
