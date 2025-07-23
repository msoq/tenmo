'use client';

import { useEffect, useRef } from 'react';
import type { Phrase as PhraseType } from '@/components/phrase-settings-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PhraseFeedbackProps {
  phrases: PhraseType[];
  submittedPhrases: PhraseType[];
  allCompleted: boolean;
}

export function PhraseFeedback({
  phrases,
  allCompleted,
  submittedPhrases,
}: PhraseFeedbackProps) {
  const loadingPhrase = phrases.find((phrase) => phrase.isLoading);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new content is added (submitted phrases or loading phrase)
  useEffect(() => {
    const scrollContainer = containerRef.current?.parentElement;

    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [submittedPhrases.length, loadingPhrase?.id]);

  if (submittedPhrases.length === 0 && !loadingPhrase && !allCompleted) {
    return null;
  }

  return (
    <div ref={containerRef} className="p-4 space-y-2">
      {submittedPhrases.map((phrase) => (
        <motion.div
          key={phrase.id}
          layout
          initial={{ opacity: 0, height: 0, y: 0 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          transition={{
            duration: 0.4,
            layout: { duration: 0.4, ease: 'easeInOut' },
          }}
        >
          <Card
            className={
              phrase.isCorrect === true
                ? 'bg-green-50 border-green-200'
                : phrase.isCorrect === false
                  ? 'bg-red-50 border-red-200'
                  : ''
            }
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {phrase.isCorrect === true && (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                )}
                {phrase.isCorrect === false && (
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{phrase.text}</div>
                  {phrase.userTranslation && (
                    <div className="text-sm text-muted-foreground mt-1">
                      → {phrase.userTranslation}
                    </div>
                  )}
                  {phrase.isCorrect === false && phrase.feedback && (
                    <div className="text-xs text-red-600 mt-1">
                      {phrase.feedback}
                    </div>
                  )}
                  {phrase.isCorrect === false &&
                    phrase.suggestions &&
                    phrase.suggestions.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Suggestions:
                        <ul className="list-disc list-inside mt-0.5">
                          {phrase.suggestions.map((suggestion, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: accepted
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      {loadingPhrase && (
        <motion.div
          key={loadingPhrase.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{
            duration: 0.3,
            layout: { duration: 0.4, ease: 'easeInOut' },
          }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
                <div className="flex-1">
                  <div className="font-medium">{loadingPhrase.text}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    → {loadingPhrase.userTranslation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {allCompleted && (
        <div className="p-4 text-center">
          <p className="text-lg font-medium text-green-600">
            🎉 All phrases completed!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Great job! Generate new phrases to continue learning.
          </p>
        </div>
      )}
    </div>
  );
}
