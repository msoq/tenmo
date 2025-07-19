'use client';

import { useEffect, useState, useCallback } from 'react';
import { PhrasesList } from '@/components/phrases-list';
import type { PhraseParams, Phrase } from '@/components/phrase-settings';
import { generateUUID } from '@/lib/utils';

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
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhrases = useCallback(async (phraseParams: PhraseParams) => {
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
      // Transform API response to Phrase objects with unique IDs
      const phrasesWithIds = data.phrases.map((phraseText: string) => ({
        id: generateUUID(),
        phrase: phraseText,
        userTranslation: '',
        isSubmitted: false,
        isLoading: false
      }));
      setPhrases(phrasesWithIds);
    } catch (error) {
      console.error('Error fetching phrases:', error);
      setError('Failed to generate phrases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRepeat = () => {
    fetchPhrases(params);
  };

  const updatePhraseTranslation = (id: string, translation: string) => {
    setPhrases(prev => prev.map(phrase => 
      phrase.id === id 
        ? { ...phrase, userTranslation: translation }
        : phrase
    ));
  };

  const updatePhraseFeedback = (id: string, feedback: string, isCorrect: boolean) => {
    setPhrases(prev => prev.map(phrase => 
      phrase.id === id 
        ? { ...phrase, feedback, isCorrect, isLoading: false }
        : phrase
    ));
  };

  const markPhraseSubmitted = async (id: string) => {
    // Find the phrase to get the user's translation
    const phrase = phrases.find(p => p.id === id);
    if (!phrase || !phrase.userTranslation.trim()) return;

    // Set loading state
    setPhrases(prev => prev.map(p => 
      p.id === id 
        ? { ...p, isSubmitted: true, isLoading: true }
        : p
    ));

    // Simulate API call for translation feedback
    // In Step 3, this will be replaced with actual API call to /api/phrase/feedback
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simulate network delay
      
      // Mock feedback logic - in reality this will come from AI
      const isCorrect = Math.random() > 0.3; // 70% chance of being "correct" for demo
      const feedback = isCorrect 
        ? `Great job! Your translation "${phrase.userTranslation}" captures the meaning well.`
        : `Good attempt! Your translation "${phrase.userTranslation}" could be improved. Consider the context and try again.`;
      
      updatePhraseFeedback(id, feedback, isCorrect);
    } catch (error) {
      console.error('Error getting translation feedback:', error);
      // Reset on error
      setPhrases(prev => prev.map(p => 
        p.id === id 
          ? { ...p, isSubmitted: false, isLoading: false }
          : p
      ));
    }
  };

  useEffect(() => {
    fetchPhrases(params);
  }, [fetchPhrases, params]);

  return (
    <PhrasesList
      phrases={phrases}
      params={params}
      onParamsChange={setParams}
      onRepeat={handleRepeat}
      isLoading={isLoading}
      error={error}
      onTranslationChange={updatePhraseTranslation}
      onSubmitTranslation={markPhraseSubmitted}
    />
  );
}
