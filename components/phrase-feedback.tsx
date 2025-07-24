'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Phrase as PhraseType } from '@/components/phrase-settings-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhraseFeedbackProps {
  phrases: PhraseType[];
  submittedPhrases: PhraseType[];
  allCompleted: boolean;
  onGenerateNewPhrases: () => void;
}

export function PhraseFeedback({
  phrases,
  allCompleted,
  submittedPhrases,
  onGenerateNewPhrases,
}: PhraseFeedbackProps) {
  const loadingPhrase = phrases.find((phrase) => phrase.isLoading);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new content is added (submitted phrases or loading phrase)
  useEffect(() => {
    const scrollContainer = containerRef.current?.parentElement;

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [submittedPhrases.length, loadingPhrase?.id]);

  if (submittedPhrases.length === 0 && !loadingPhrase && !allCompleted) {
    return null;
  }

  return (
    <div ref={containerRef} className="p-4 space-y-2">
      <AnimatePresence>
        {[...submittedPhrases, ...(loadingPhrase ? [loadingPhrase] : [])].map(
          (phrase) => {
            const isLoading = phrase.isLoading;

            return (
              <motion.div
                key={phrase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={cn(
                    isLoading && 'bg-blue-50 border-blue-200',
                    phrase.isCorrect === true && 'bg-green-50 border-green-200',
                    phrase.isCorrect === false && 'bg-red-50 border-red-200',
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AnimatePresence mode="wait">
                        {isLoading && (
                          <motion.div
                            key="loading-icon"
                            initial={{ scale: 1 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Loader2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
                          </motion.div>
                        )}
                        {!isLoading && phrase.isCorrect === true && (
                          <motion.div
                            key="check-icon"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.3,
                              type: 'spring',
                              stiffness: 500,
                            }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          </motion.div>
                        )}
                        {!isLoading && phrase.isCorrect === false && (
                          <motion.div
                            key="x-icon"
                            initial={{ scale: 0, rotate: 90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.3,
                              type: 'spring',
                              stiffness: 500,
                            }}
                          >
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          </motion.div>
                        )}
                      </AnimatePresence>
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
            );
          },
        )}
      </AnimatePresence>
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 text-center"
          >
            <p className="text-lg font-medium text-green-600">
              🎉 All phrases completed!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Great job! Generate new phrases to continue learning.
            </p>
            <Button
              onClick={onGenerateNewPhrases}
              variant="outline"
              className="mt-4"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
