'use client';

import { useState } from 'react';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { PhraseSettingsToggle } from '@/components/phrase-settings-toggle';
import {
  PhraseSettings,
  type PhraseParams,
  type Phrase as PhraseType,
} from '@/components/phrase-settings';
import { Phrase } from '@/components/phrase';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PhrasesListProps {
  phrases: PhraseType[];
  params: PhraseParams;
  onParamsChange: (params: PhraseParams) => void;
  onRepeat: () => void;
  isLoading?: boolean;
  error?: string | null;
  onTranslationChange?: (id: string, translation: string) => void;
  onSubmitTranslation?: (id: string) => void;
}

export function PhrasesList({
  phrases,
  params,
  onParamsChange,
  onRepeat,
  isLoading = false,
  error,
  onTranslationChange,
  onSubmitTranslation,
}: PhrasesListProps) {
  if (isLoading) {
    return (
      <PhrasesListContainer params={params} onParamsChange={onParamsChange}>
        <PhrasesLoading />
      </PhrasesListContainer>
    );
  }

  if (error) {
    return (
      <PhrasesListContainer params={params} onParamsChange={onParamsChange}>
        <PhrasesError error={error} onRepeat={onRepeat} />
      </PhrasesListContainer>
    );
  }

  return (
    <PhrasesListContainer params={params} onParamsChange={onParamsChange}>
      <Phrases
        phrases={phrases}
        onRepeat={onRepeat}
        isLoading={isLoading}
        params={params}
        onTranslationChange={onTranslationChange}
        onSubmitTranslation={onSubmitTranslation}
      />
    </PhrasesListContainer>
  );
}

function PhrasesListContainer({
  children,
  params,
  onParamsChange,
}: {
  children: React.ReactNode;
  params: PhraseParams;
  onParamsChange: (params: PhraseParams) => void;
}) {
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
        <PhraseSettingsToggle
          showSettings={showSettings}
          onToggle={handleToggleSettings}
        />
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {showSettings && (
            <PhraseSettings params={params} onParamsChange={onParamsChange} />
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

function PhrasesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-lg text-muted-foreground">Generating phrases...</p>
      </div>
    </div>
  );
}

function PhrasesError({ error, onRepeat }: Partial<PhrasesListProps>) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={onRepeat} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  );
}

function Phrases({
  phrases,
  onRepeat,
  isLoading,
  params,
  onTranslationChange,
  onSubmitTranslation,
}: Partial<PhrasesListProps> & { params?: PhraseParams }) {
  const completedCount = phrases?.filter((p) => p.isSubmitted).length || 0;
  const correctCount =
    phrases?.filter((p) => p.isSubmitted && p.isCorrect).length || 0;
  const totalCount = phrases?.length || 0;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Generated Phrases</h2>
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
              {completedCount > 0 && (
                <span className="ml-2 text-green-600">
                  ({correctCount} correct)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
      {phrases && phrases.length > 0 ? (
        <div className="grid gap-4">
          {phrases.map((phrase) => (
            <Phrase
              key={phrase.id}
              phrase={phrase}
              onTranslationChange={onTranslationChange || (() => {})}
              onSubmitTranslation={onSubmitTranslation || (() => {})}
            />
          ))}

          {/* Generate New Phrases Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onRepeat}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Generate New Phrases
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-muted-foreground">
            Ready to Practice?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Configure your language learning settings above and generate phrases
            to start practicing translations.
          </p>
        </div>
      )}
    </div>
  );
}
