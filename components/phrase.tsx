'use client';

import type { Phrase as PhraseType } from '@/components/phrase-settings-dialog';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface PhraseProps {
  phrases: PhraseType[];
  isLoading?: boolean;
  error?: string | null;
  onGenerateNewPhrases?: () => void;
}

export function Phrase({
  phrases,
  isLoading = false,
  error,
  onGenerateNewPhrases,
}: PhraseProps) {
  const currentPhrase = phrases.find(
    (phrase) => !phrase.isSubmitted && !phrase.isLoading,
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading phrases...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!currentPhrase) {
    return (
      <div className="p-4 text-center">
        <Button onClick={onGenerateNewPhrases} variant="outline">
          <RotateCcw className="w-4 h-4" />
          Restart
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <motion.p
        key={currentPhrase.id}
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
