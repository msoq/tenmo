'use client';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { TopicGrid } from '@/components/topic-grid';

export default function TopicsPage() {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto">
          <TopicGrid />
        </div>
      </main>
    </div>
  );
}
