import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import type {
  Phrase,
  PhraseParams,
  FeedbackRequest,
  FeedbackResponse,
} from '@/components/phrase-settings';
import { generateUUID } from '@/lib/utils';

const PHRASES_MUTATION_KEY = 'phrases';

async function generatePhrasesAPI(params: PhraseParams): Promise<Phrase[]> {
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
  params: PhraseParams,
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

export function usePhrases(params: PhraseParams | null | undefined) {
  const { data: phrases = [], error } = useSWR<Phrase[]>(PHRASES_MUTATION_KEY);

  // Mutation for generating phrases
  const { trigger: triggerGenerate, isMutating: isLoading } = useSWRMutation(
    PHRASES_MUTATION_KEY,
    () => (params ? generatePhrasesAPI(params) : Promise.resolve([])),
    { populateCache: true, revalidate: false },
  );

  const submitFeedbackAndUpdateCache = useCallback(
    async (phrase: Phrase) => {
      if (!params) {
        throw new Error('Cannot submit feedback without language settings');
      }

      const { id, feedback, isCorrect, suggestions } =
        await submitTranslationFeedback(phrase, params);

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
    [params],
  );

  const generatePhrases = useCallback(async () => {
    try {
      return await triggerGenerate();
    } catch (error) {
      console.error('Failed to generate phrases:', error);
      throw error;
    }
  }, [triggerGenerate]);

  const submitTranslation = useCallback(
    async (id: string, userTranslation: string) => {
      const phrase = phrases.find((p) => p.id === id);

      if (!phrase) {
        throw new Error('Phrase not found');
      }

      mutate(PHRASES_MUTATION_KEY, setPhraseState(id, 'isLoading', true));
      mutate(
        PHRASES_MUTATION_KEY,
        setPhraseState(id, 'userTranslation', userTranslation),
      );

      try {
        await submitFeedbackAndUpdateCache({ ...phrase, userTranslation });
      } catch (error) {
        // Revert loading state on error
        mutate(PHRASES_MUTATION_KEY, setPhraseState(id, 'isLoading', false));
        console.error('Failed to submit translation:', error);
        throw error;
      }
    },
    [phrases, submitFeedbackAndUpdateCache],
  );

  return {
    phrases,
    error,
    isLoading,
    generatePhrases,
    submitTranslation,
  };
}
