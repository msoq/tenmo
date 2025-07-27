'use client';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function PhraseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-destructive">
                Request Failed
              </h1>
              <p className="text-muted-foreground">
                Something went wrong while processing your request. Please try again.
              </p>
            </div>

            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
