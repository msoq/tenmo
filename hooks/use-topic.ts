import useSWR from 'swr';
import type { Topic } from '@/lib/db/schema';

interface UseTopicOptions {
  fallbackData?: Topic;
}

const fetcher = async (url: string): Promise<Topic> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch topic');
  }
  
  return response.json();
};

export function useTopic(id: string | null, options?: UseTopicOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/topics/${id}` : null,
    fetcher,
    {
      fallbackData: options?.fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    topic: data,
    error,
    isLoading,
    mutate,
  };
}