'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTopics } from '@/hooks/use-topics';
import { TopicCard } from '@/components/topic-card';
import { Button } from '@/components/ui/button';
import { LanguageSelect } from '@/components/ui/language-select';
import { Loader2, Plus } from 'lucide-react';

interface TopicGridProps {
  className?: string;
}

export function TopicGrid({ className }: TopicGridProps) {
  const router = useRouter();

  // Language filtering
  const [fromLanguage, setFromLanguage] = useState<string>('');
  const [toLanguage, setToLanguage] = useState<string>('');

  const { topics, isLoading, error } = useTopics(
    fromLanguage && toLanguage
      ? {
          activeOnly: true,
          fromLanguage,
          toLanguage,
        }
      : null,
  );

  const handleCreateTopic = () => {
    router.push('/topics/new');
  };

  return (
    <>
      {/* Header with Create Button */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Topics</h2>
        <Button onClick={handleCreateTopic}>
          <Plus className="size-4 mr-2" />
          Create Topic
        </Button>
      </div>

      {/* Language selectors */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">From:</span>
          <LanguageSelect
            value={fromLanguage}
            onValueChange={setFromLanguage}
            className="w-48"
            placeholder="Select"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To:</span>
          <LanguageSelect
            value={toLanguage}
            onValueChange={setToLanguage}
            className="w-48"
            placeholder="Select"
          />
        </div>
      </div>

      {/* Language selection message */}
      {(!fromLanguage || !toLanguage) && (
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Choose your source and target languages to explore available topics
            and create personalized learning content.
          </p>
        </div>
      )}

      {/* Topics Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading topics...
          </span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">
            Failed to load topics. Please try again later.
          </p>
        </div>
      ) : !topics || topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-sm text-muted-foreground text-center">
            No topics found for this language pair.
          </p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
            </p>
          </div>

          {/* Topics Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
          >
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
