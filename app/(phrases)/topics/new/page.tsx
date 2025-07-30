'use client';

import Link from 'next/link';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { TopicForm } from '@/components/topic-form';
import { createTopicAction } from '../actions';

export default function CreateTopicPage() {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 border-b">
        <SidebarToggle />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <div className="mb-6">
            <Link 
              href="/topics"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Topics
            </Link>
          </div>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Topic</h1>
            <p className="text-muted-foreground">
              Add a new language learning topic for practice sessions.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border rounded-lg p-6">
            <TopicForm mode="create" action={createTopicAction} />
          </div>
        </div>
      </main>
    </div>
  );
}