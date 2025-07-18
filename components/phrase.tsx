'use client';

import { SidebarToggle } from '@/components/sidebar-toggle';

interface PhraseProps {
  phrases: string[];
}

export function Phrase({ phrases }: PhraseProps) {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {phrases.length > 0 ? (
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
            </div>
          ) : (
            <p className="text-muted-foreground">No phrases generated.</p>
          )}
        </div>
      </main>
    </div>
  );
}
