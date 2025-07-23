import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { generateUUID } from '@/lib/utils';
import { toast } from 'sonner';
import type {
  PhraseSettings,
  Phrase,
  FeedbackResponse,
  FeedbackRequest,
} from '@/components/phrase-settings-dialog';

const PHRASES_MUTATION_KEY = 'phrases';

async function generatePhrases(params: PhraseSettings): Promise<Phrase[]> {
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
  const phrases = data.phrases.map((text: string) => ({
    id: generateUUID(),
    text,
    userTranslation: '',
    isSubmitted: false,
    isLoading: false,
  }));

  return phrases;
}

async function submitTranslationFeedback(
  phrase: Phrase,
  params: PhraseSettings,
): Promise<FeedbackResponse> {
  const requestBody: FeedbackRequest = {
    id: phrase.id,
    text: phrase.text,
    userTranslation: phrase.userTranslation,
    from: params.from,
    to: params.to,
    level: params.level,
  };

  const response = await fetch('/api/phrase/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Failed to get translation feedback');
  }

  return response.json();
}

const setPhraseState =
  (id: string, key: keyof Phrase, value: any) =>
  (phrases: Phrase[] = []) =>
    phrases.map((phrase) =>
      phrase.id === id ? { ...phrase, [key]: value } : phrase,
    );

export function usePhrases(settings: PhraseSettings | null | undefined) {
  const { data: phrases = [], error } = useSWR<Phrase[]>(PHRASES_MUTATION_KEY);
  const submittedPhrases = phrases.filter((phrase) => phrase.isSubmitted);
  const allCompleted =
    phrases.length > 0 && submittedPhrases.length === phrases.length;

  // Mutation for generating phrases
  const {
    trigger: triggerGenerate,
    isMutating: isLoading,
    reset,
  } = useSWRMutation(
    PHRASES_MUTATION_KEY,
    () => (settings ? generatePhrases(settings) : Promise.resolve([])),
    { populateCache: true, revalidate: false },
  );

  const submitFeedbackAndUpdateCache = useCallback(
    async (phrase: Phrase) => {
      if (!settings) {
        throw new Error('Cannot submit feedback without language settings');
      }

      const { id, feedback, isCorrect, suggestions } =
        await submitTranslationFeedback(phrase, settings);

      // Update the phrases cache directly
      mutate(PHRASES_MUTATION_KEY, (currentPhrases: Phrase[] = []) =>
        currentPhrases.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              feedback,
              isCorrect,
              suggestions,
              isSubmitted: true,
              isLoading: false,
            };
          }
          return p;
        }),
      );
    },
    [settings],
  );

  const getPhrases = useCallback(async () => {
    try {
      mutate(PHRASES_MUTATION_KEY, [], false);
      reset();
      return await triggerGenerate();
    } catch (error) {
      console.error('Failed to generate phrases:', error);
      throw error;
    }
  }, [triggerGenerate, reset]);

  const submitTranslation = useCallback(
    async (phrase: Phrase, userTranslation: string) => {
      mutate(
        PHRASES_MUTATION_KEY,
        setPhraseState(phrase.id, 'isLoading', true),
      );
      mutate(
        PHRASES_MUTATION_KEY,
        setPhraseState(phrase.id, 'userTranslation', userTranslation),
      );

      try {
        await submitFeedbackAndUpdateCache({ ...phrase, userTranslation });
      } catch (error) {
        // Revert loading state on error
        mutate(
          PHRASES_MUTATION_KEY,
          setPhraseState(phrase.id, 'isLoading', false),
        );

        toast.error('Failed to submit translation');
      }
    },
    [phrases, submitFeedbackAndUpdateCache],
  );

  return {
    phrases,
    submittedPhrases,
    allCompleted,
    error,
    isLoading,
    getPhrases,
    submitTranslation,
  };
}
