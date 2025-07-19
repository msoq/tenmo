'use client';

import { useState } from 'react';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { PhraseSettingsToggle } from '@/components/phrase-settings-toggle';
import {
  PhraseSettings,
  type PhraseParams,
} from '@/components/phrase-settings';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw } from 'lucide-react';

interface PhraseProps {
  phrases: string[];
  params: PhraseParams;
  onParamsChange: (params: PhraseParams) => void;
  onRepeat: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function Phrase({
  phrases,
  params,
  onParamsChange,
  onRepeat,
  isLoading = false,
  error,
}: PhraseProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  if (isLoading) {
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
            {/* Settings Panel */}
            {showSettings && (
              <PhraseSettings params={params} onParamsChange={onParamsChange} />
            )}

            {/* Loading Content */}
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="text-lg text-muted-foreground">
                  Generating phrases...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
            {/* Settings Panel */}
            {showSettings && (
              <PhraseSettings params={params} onParamsChange={onParamsChange} />
            )}

            {/* Error Content */}
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <p className="text-lg text-destructive">{error}</p>
                <Button onClick={onRepeat} variant="default">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {/* Parameter Controls */}
          {showSettings && (
            <PhraseSettings params={params} onParamsChange={onParamsChange} />
          )}

          {/* Generated Phrases */}
          {phrases.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Generated Phrases</h2>
              <div className="grid gap-4">
                {phrases.map((phrase, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: it's safe here
                    key={index}
                    className="p-4 bg-card rounded-lg border border-border"
                  >
                    <p className="text-lg">{phrase}</p>
                  </div>
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
          ) : (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                {showSettings
                  ? 'Configure your settings above and generate phrases to get started.'
                  : 'Click the settings icon to configure your language learning preferences.'}
              </p>
              {!showSettings && (
                <Button onClick={handleToggleSettings} variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Open Settings
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
