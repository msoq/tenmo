'use client';

import { useEffect, useState } from 'react';
import { PhrasesList } from '@/components/phrases-list';
import { PhraseSettingsDialog } from '@/components/phrase-settings-dialog';
import { PhraseSettingsToggle } from '@/components/phrase-settings-toggle';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { usePhrases } from '@/hooks/use-phrases';
import { useUserPhrasesSettings } from '@/hooks/use-user-phrases-settings';

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

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
        <PhraseSettingsToggle
          showSettings={showSettings}
          onToggle={() => setShowSettings(!showSettings)}
        />
      </header>
      <main className="flex-1">
        <PhrasesList
          phrases={phrases}
          isLoading={settingsLoading || phrasesLoading}
          error={settingsError || phrasesError}
          onSubmitTranslation={submitTranslation}
        />
      </main>

      <PhraseSettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </div>
  );
}
