import type {
  FeedbackRequest,
  FeedbackResponse,
  Phrase,
  PhraseSettings,
} from '@/components/phrase-settings-dialog';
import { generateUUID } from '@/lib/utils';
import { normalizeLanguageToName } from '@/lib/utils/language-utils';
import type { Topic } from '@/lib/db/schema';
import { useCallback } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useUserPreferences } from './use-user-preferences';

const PHRASES_MUTATION_KEY = 'phrases';

async function generatePhrasesMutation(
  url: string,
  {
    arg,
  }: {
    arg: {
      settings: PhraseSettings;
      topics: Topic[];
      from: string;
      to: string;
    };
  },
): Promise<Phrase[]> {
  const { settings, topics, from, to } = arg;

  // Filter topics to only include the ones selected in settings
  const selectedTopics = topics
    .filter((topic) => settings.topicIds.includes(topic.id))
    .map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description || '',
    }));

  if (selectedTopics.length === 0) {
    throw new Error('No valid topics found for phrase generation');
  }

  // Prepare request body with all necessary data
  const requestBody = {
    from: normalizeLanguageToName(from),
    to: normalizeLanguageToName(to),
    topics: selectedTopics,
    count: settings.count,
    instruction: settings.instruction || 'None',
    level: settings.level,
    phraseLength: settings.phraseLength,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate phrases: ${errorText}`);
  }

  const data = await response.json();

  // Transform API response to Phrase objects with unique IDs
  const phrases = data.phrases.map(
    (item: { text: string; topicId: string }) => ({
      id: generateUUID(),
      text: item.text,
      topicId: item.topicId,
      userTranslation: '',
      isSubmitted: false,
      isLoading: false,
    }),
  );

  return phrases;
}

// SWR mutation function for submitting feedback
async function submitFeedbackMutation(
  url: string,
  { arg }: { arg: { phrase: Phrase; from: string; to: string } },
): Promise<FeedbackResponse> {
  const { phrase, from, to } = arg;

  if (!phrase.topicId) {
    throw new Error('Phrase must have a topicId for feedback');
  }

  const requestBody: FeedbackRequest = {
    topicId: phrase.topicId,
    userTranslation: phrase.userTranslation,
    phraseText: phrase.text,
    from,
    to,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get translation feedback: ${errorText}`);
  }

  return response.json();
}

const setPhraseState =
  (id: string, key: keyof Phrase, value: any) =>
  (phrases: Phrase[] = []) =>
    phrases.map((phrase) =>
      phrase.id === id ? { ...phrase, [key]: value } : phrase,
    );

export function usePhrases(
  settings: PhraseSettings | null | undefined,
  topics: Topic[],
) {
  const { prefs } = useUserPreferences();
  const { data: phrases = [], error } = useSWR<Phrase[]>(PHRASES_MUTATION_KEY);
  const submittedPhrases = phrases.filter((phrase) => phrase.isSubmitted);
  const allCompleted =
    phrases.length > 0 && submittedPhrases.length === phrases.length;

  const {
    trigger: triggerGenerate,
    isMutating: isGenerating,
    reset: resetGenerate,
  } = useSWRMutation('/api/phrases', generatePhrasesMutation, {
    populateCache: false,
    revalidate: false,
    onSuccess: (data) => {
      // Update the phrases cache with the generated data
      mutate(PHRASES_MUTATION_KEY, data, false);
    },
    onError: (error) => {
      console.error('Failed to generate phrases:', error);
      toast.error('Failed to generate phrases');
    },
  });

  const { trigger: triggerFeedback, isMutating: isSubmittingFeedback } =
    useSWRMutation('/api/phrases/feedback', submitFeedbackMutation);

  const getPhrases = useCallback(async () => {
    if (!settings) {
      throw new Error('Settings are required to generate phrases');
    }
    if (!prefs?.from || !prefs?.to) {
      throw new Error('Language pair is required to generate phrases');
    }

    // Clear existing phrases and trigger generation
    mutate(PHRASES_MUTATION_KEY, [], false);
    resetGenerate();

    return await triggerGenerate({
      settings,
      topics,
      from: prefs.from,
      to: prefs.to,
    });
  }, [
    settings,
    topics,
    prefs?.from,
    prefs?.to,
    triggerGenerate,
    resetGenerate,
  ]);

  const submitTranslation = useCallback(
    async (phrase: Phrase, userTranslation: string) => {
      if (!prefs?.from || !prefs?.to) {
        toast.error('Language pair is required to get feedback');
        return;
      }
      // Update loading state and user translation
      mutate(
        PHRASES_MUTATION_KEY,
        (currentPhrases: Phrase[] = []) =>
          currentPhrases.map((p) =>
            p.id === phrase.id ? { ...p, isLoading: true, userTranslation } : p,
          ),
        false,
      );

      try {
        // Submit feedback
        const feedbackData = await triggerFeedback({
          phrase: { ...phrase, userTranslation },
          from: prefs.from,
          to: prefs.to,
        });

        // Update the phrases cache with feedback data
        if (feedbackData) {
          mutate(
            PHRASES_MUTATION_KEY,
            (currentPhrases: Phrase[] = []) =>
              currentPhrases.map((p) => {
                if (p.id === phrase.id) {
                  return {
                    ...p,
                    feedback: feedbackData.feedback,
                    isCorrect: feedbackData.isCorrect,
                    suggestions: feedbackData.suggestions,
                    isSubmitted: true,
                    isLoading: false,
                  };
                }
                return p;
              }),
            false,
          );
        }
      } catch (error) {
        // Revert loading state on error
        mutate(
          PHRASES_MUTATION_KEY,
          setPhraseState(phrase.id, 'isLoading', false),
          false,
        );
      }
    },
    [triggerFeedback, prefs?.from, prefs?.to],
  );

  return {
    phrases,
    submittedPhrases,
    allCompleted,
    error,
    isLoading: isGenerating || isSubmittingFeedback,
    getPhrases,
    submitTranslation,
  };
}
