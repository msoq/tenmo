import { useCallback } from 'react';
import useSWR from 'swr';
import type { Phrase, PhraseParams } from '@/components/phrase-settings';
import { generateUUID } from '@/lib/utils';

// Fetcher function for phrase generation
async function generatePhrases(params: PhraseParams): Promise<Phrase[]> {
  const response = await fetch('/api/phrase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate phrases');
  }

  const data = await response.json();
  
  // Transform API response to Phrase objects with unique IDs
  return data.phrases.map((phraseText: string) => ({
    id: generateUUID(),
    phrase: phraseText,
    userTranslation: '',
    isSubmitted: false,
    isLoading: false,
  }));
}

// Mock translation feedback function (will be replaced with real API in Step 3)
async function submitTranslationFeedback(phrase: Phrase): Promise<{ feedback: string; isCorrect: boolean }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock feedback logic - in reality this will come from AI
  const isCorrect = Math.random() > 0.3; // 70% chance of being "correct" for demo
  const feedback = isCorrect 
    ? `Great job! Your translation "${phrase.userTranslation}" captures the meaning well.`
    : `Good attempt! Your translation "${phrase.userTranslation}" could be improved. Consider the context and try again.`;
  
  return { feedback, isCorrect };
}

export function usePhrases(params: PhraseParams) {
  const { data: phrases, error, isLoading, mutate } = useSWR(
    ['phrases', params],
    () => generatePhrases(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Don't refetch same params within 5s
      errorRetryCount: 3,
    }
  );

  // Update translation optimistically
  const updateTranslation = useCallback((id: string, translation: string) => {
    if (!phrases) return;
    
    const updatedPhrases = phrases.map(phrase => 
      phrase.id === id 
        ? { ...phrase, userTranslation: translation }
        : phrase
    );
    
    // Update cache without revalidation
    mutate(updatedPhrases, false);
  }, [phrases, mutate]);

  // Submit translation with optimistic updates
  const submitTranslation = useCallback(async (id: string) => {
    if (!phrases) return;
    
    const phrase = phrases.find(p => p.id === id);
    if (!phrase || !phrase.userTranslation.trim()) return;

    // Optimistic update: set loading state
    const optimisticPhrases = phrases.map(p => 
      p.id === id 
        ? { ...p, isSubmitted: true, isLoading: true }
        : p
    );
    mutate(optimisticPhrases, false);

    try {
      // Get feedback from API
      const { feedback, isCorrect } = await submitTranslationFeedback(phrase);
      
      // Update with real data
      const finalPhrases = phrases.map(p => 
        p.id === id 
          ? { ...p, isSubmitted: true, isLoading: false, feedback, isCorrect }
          : p
      );
      mutate(finalPhrases, false);
    } catch (error) {
      console.error('Error getting translation feedback:', error);
      
      // Rollback on error
      const rolledBackPhrases = phrases.map(p => 
        p.id === id 
          ? { ...p, isSubmitted: false, isLoading: false }
          : p
      );
      mutate(rolledBackPhrases, false);
    }
  }, [phrases, mutate]);

  // Force regenerate phrases
  const regenerate = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    phrases: phrases || [],
    error: error?.message || null,
    isLoading,
    updateTranslation,
    submitTranslation,
    regenerate,
  };
}