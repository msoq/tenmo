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
  params: PhraseParams | null | undefined;
  onRepeat: () => void;
  isLoading?: boolean;
  error?: string | null;
  onSubmitTranslation?: (id: string, translation: string) => void;
}

export function PhrasesList({
  phrases,
  params,
  onRepeat,
  isLoading = false,
  error,
  onSubmitTranslation,
}: PhrasesListProps) {
  if (!params) {
    return (
      <PhrasesListContainer>
        <ReadyToPractice />
      </PhrasesListContainer>
    );
  }

  if (isLoading) {
    return (
      <PhrasesListContainer>
        <PhrasesLoading />
      </PhrasesListContainer>
    );
  }

  if (error) {
    return (
      <PhrasesListContainer>
        <PhrasesError error={error} onRepeat={onRepeat} />
      </PhrasesListContainer>
    );
  }

  return (
    <PhrasesListContainer>
      <Phrases
        phrases={phrases}
        onRepeat={onRepeat}
        isLoading={isLoading}
        onSubmitTranslation={onSubmitTranslation}
      />
    </PhrasesListContainer>
  );
}

function PhrasesListContainer({
  children,
}: {
  children: React.ReactNode;
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
          {showSettings && <PhraseSettings />}
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

function ReadyToPractice() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold">Ready to Practice?</h2>
          <p className="text-muted-foreground text-lg">
            Set up your language preferences in the settings above to start
            practicing with personalized phrases.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
          <span className="text-base">👆</span>
          <span>Click the settings icon to configure your preferences</span>
        </div>
      </div>
    </div>
  );
}

function Phrases({
  phrases,
  onRepeat,
  isLoading,
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
      {phrases && phrases.length > 0 && (
        <div className="grid gap-4">
          {phrases.map((phrase) => (
            <Phrase
              key={phrase.id}
              phrase={phrase}
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
      )}
    </div>
  );
}
