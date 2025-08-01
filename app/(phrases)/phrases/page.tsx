'use client';

import { useEffect, useState } from 'react';
import { Phrase } from '@/components/phrase';
import { PhraseFeedback } from '@/components/phrase-feedback';
import { PhraseInitialInstructions } from '@/components/phrase-initial-instructions';
import { PhraseSettingsDialog } from '@/components/phrase-settings-dialog';
import { PhraseSettingsToggle } from '@/components/phrase-settings-toggle';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { AIInput } from '@/components/ui/ai-input';
import { usePhrases } from '@/hooks/use-phrases';
import { useUserPhrasesSettings } from '@/hooks/use-user-phrases-settings';
import { toast } from 'sonner';

export default function Page() {
  const [showSettings, setShowSettings] = useState(false);

  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useUserPhrasesSettings();

  const {
    phrases,
    allCompleted,
    submittedPhrases,
    error: phrasesError,
    isLoading: phrasesLoading,
    getPhrases,
    submitTranslation,
  } = usePhrases(settings);

  // get phrases when settings are loaded
  useEffect(() => {
    if (settings && !settingsLoading) {
      getPhrases();
    }
  }, [settings, settingsLoading, getPhrases]);

  const handleSubmit = (userTranslation: string) => {
    const loadingPhrase = phrases.find((phrase) => phrase.isLoading);
    const phraseToSubmit = phrases.find((phrase) => !phrase.isSubmitted);

    if (loadingPhrase) {
      toast.warning('Wait for feedback before submitting the next phrase');
      return false;
    }

    if (!phraseToSubmit) {
      toast.warning('Phrase does not exist');
      return false;
    }

    submitTranslation(phraseToSubmit, userTranslation);

    return true;
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
        <PhraseSettingsToggle
          showSettings={showSettings}
          onToggle={() => setShowSettings(!showSettings)}
        />
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">
        {settingsLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">Loading...</div>
          </div>
        )}

        {!settingsLoading && settings === null && (
          <div className="flex-1 flex items-center justify-center">
            <PhraseInitialInstructions />
          </div>
        )}

        {!settingsLoading && settings !== null && (
          <>
            <div className="overflow-y-auto">
              <PhraseFeedback
                phrases={phrases}
                allCompleted={allCompleted}
                submittedPhrases={submittedPhrases}
                onGenerateNewPhrases={getPhrases}
              />
            </div>
            <div className="mt-auto">
              <Phrase
                phrases={phrases}
                isLoading={phrasesLoading}
                error={settingsError || phrasesError}
              />
            </div>
          </>
        )}
      </main>

      {!settingsLoading && settings !== null && (
        <footer>
          <AIInput
            onSubmit={handleSubmit}
            disabled={phrasesLoading || allCompleted}
            className="px-4 pb-10"
            placeholder={
              phrasesLoading ? 'Phrases are loading...' : 'Translate the phrase'
            }
          />
        </footer>
      )}

      <PhraseSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
