'use client';

import { useState, useEffect } from 'react';
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

  // Language filtering with browser detection
  const [languagesInitialized, setLanguagesInitialized] = useState(false);
  const [fromLanguage, setFromLanguage] = useState<string>('');
  const [toLanguage, setToLanguage] = useState<string>('');

  // Initialize languages on mount with browser detection
  useEffect(() => {
    // Get browser language (e.g., 'en-US' -> 'en')
    const browserLang = navigator.language.split('-')[0].toLowerCase();

    // Set from language to browser language if it's a valid 2-letter code
    if (/^[a-z]{2}$/.test(browserLang)) {
      setFromLanguage(browserLang);
      // Set common learning pair
      setToLanguage(browserLang === 'en' ? 'es' : 'en');
    } else {
      // Fallback to English -> Spanish
      setFromLanguage('en');
      setToLanguage('es');
    }
    setLanguagesInitialized(true);
  }, []);

  // Only fetch topics after languages are initialized
  const { topics, isLoading, error } = useTopics(
    languagesInitialized
      ? {
          activeOnly: true,
          fromLanguage: fromLanguage || undefined,
          toLanguage: toLanguage || undefined,
        }
      : null, // Don't fetch until languages are set
  );

  const handleCreateTopic = () => {
    router.push('/topics/new');
  };

  // No filtering needed - just use topics directly

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
            placeholder="Select source language"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">To:</span>
          <LanguageSelect
            value={toLanguage}
            onValueChange={setToLanguage}
            className="w-48"
            placeholder="Select target language"
          />
        </div>
      </div>

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
