import useSWR from 'swr';
import type { Topic } from '@/lib/db/schema';

export interface TopicsParams {
  limit?: number;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: string;
  createdByUserId?: string;
  activeOnly?: boolean;
}

const TOPICS_MUTATION_KEY = 'topics';

async function fetchTopics(params: TopicsParams = {}): Promise<Topic[]> {
  const searchParams = new URLSearchParams();

  // Add parameters to URL only if they are defined
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.level) {
    searchParams.append('level', params.level);
  }
  if (params.category) {
    searchParams.append('category', params.category);
  }
  if (params.createdByUserId) {
    searchParams.append('createdByUserId', params.createdByUserId);
  }
  if (params.activeOnly !== undefined) {
    searchParams.append('activeOnly', params.activeOnly.toString());
  }

  const url = `/api/topics${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch topics: ${response.statusText}`);
  }

  return response.json();
}

export function useTopics(params: TopicsParams = {}) {
  const key = [TOPICS_MUTATION_KEY, params];

  const {
    data: topics = [],
    error,
    isLoading,
    mutate,
  } = useSWR(key, () => fetchTopics(params), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Avoid duplicate requests for 5 seconds
  });

  return {
    topics,
    isLoading,
    error,
    mutate, // For manual revalidation
  };
}
