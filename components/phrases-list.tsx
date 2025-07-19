'use client';

import { useState } from 'react';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { PhraseSettingsToggle } from '@/components/phrase-settings-toggle';
import {
  PhraseSettings,
  type PhraseParams,
} from '@/components/phrase-settings';
import { Phrase } from '@/components/phrase';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PhrasesListProps {
  phrases: string[];
  params: PhraseParams;
  onParamsChange: (params: PhraseParams) => void;
  onRepeat: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PhrasesList({
  phrases,
  params,
  onParamsChange,
  onRepeat,
  isLoading = false,
  error,
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
      <Phrases phrases={phrases} onRepeat={onRepeat} isLoading={isLoading} />
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

function Phrases({ phrases, onRepeat, isLoading }: Partial<PhrasesListProps>) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Generated Phrases</h2>
      <div className="grid gap-4">
        {phrases?.map((phrase, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: it's fine here
          <Phrase key={index} text={phrase} />
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
    </div>
  );
}
