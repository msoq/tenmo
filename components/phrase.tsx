'use client';

import type { Phrase as PhraseType } from '@/components/phrase-settings-dialog';
import { motion } from 'framer-motion';

interface PhraseProps {
  phrases: PhraseType[];
  isLoading?: boolean;
  error?: string | null;
}

export function Phrase({ phrases, isLoading = false, error }: PhraseProps) {
  const currentPhrase = phrases.find(
    (phrase) => !phrase.isSubmitted && !phrase.isLoading,
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading phrase...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!currentPhrase) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No phrase available
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        {currentPhrase.text}
      </motion.p>
    </div>
  );
}
