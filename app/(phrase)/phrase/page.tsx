'use client';

import { useEffect, useState } from 'react';
import { Phrase } from '@/components/phrase';
import { PhraseFeedback } from '@/components/phrase-feedback';
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
    const phraseToSubmit = phrases.find((phrase) => !phrase.isSubmitted);

    if (!phraseToSubmit) {
      toast.warning('Phrase does not exist');
      return;
    }

    submitTranslation(phraseToSubmit, userTranslation);
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
      <main className="flex-1 overflow-hidden">
        <PhraseFeedback phrases={phrases} />
        <Phrase
          phrases={phrases}
          isLoading={settingsLoading || phrasesLoading}
          error={settingsError || phrasesError}
        />
      </main>
      <footer>
        <AIInput
          onSubmit={handleSubmit}
          disabled={settingsLoading || phrasesLoading}
          className="px-4 pb-10"
          placeholder={
            settingsLoading || phrasesLoading
              ? 'Phrase is loading...'
              : 'Translate the phrase'
          }
        />
      </footer>

      <PhraseSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
