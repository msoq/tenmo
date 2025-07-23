'use client';

import type { Phrase as PhraseType } from '@/components/phrase-settings-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PhraseFeedbackProps {
  phrases: PhraseType[];
}

export function PhraseFeedback({ phrases }: PhraseFeedbackProps) {
  const submittedPhrases = phrases.filter((phrase) => phrase.isSubmitted);
  const loadingPhrase = phrases.find((phrase) => phrase.isLoading);

  if (submittedPhrases.length === 0 && !loadingPhrase) {
    return null;
  }

  return (
    <div className="p-4 space-y-2">
      {submittedPhrases.map((phrase) => (
        <Card key={phrase.id}>
          <CardContent className="p-3">
            <div className="font-medium">{phrase.text}</div>
            {phrase.userTranslation && (
              <div className="text-sm text-muted-foreground mt-1">
                → {phrase.userTranslation}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {loadingPhrase && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-3">
              <div className="font-medium">{loadingPhrase.text}</div>
              <div className="text-sm text-muted-foreground mt-1">
                → {loadingPhrase.userTranslation}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
