'use client';

import { SidebarToggle } from '@/components/sidebar-toggle';

export default function Page() {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>
      <main className="flex-1 p-4">
        <div>hallo phrase</div>
      </main>
    </div>
  );
}
