'use client';

import { SidebarToggle } from '@/components/sidebar-toggle';

export default function Loading() {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
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
