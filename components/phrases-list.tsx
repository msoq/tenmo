'use client';

import type { Phrase as PhraseType } from '@/components/phrase-settings';

interface PhrasesListProps {
  phrases: PhraseType[];
  isLoading?: boolean;
  error?: string | null;
  onSubmitTranslation?: (id: string, translation: string) => void;
}

export function PhrasesList({
  phrases,
  isLoading = false,
  error,
  onSubmitTranslation,
}: PhrasesListProps) {
  return (
    <div>
      {phrases.map((phrase) => (
        <div>{phrase.text}</div>
      ))}
    </div>
  );
}
