'use client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useTopic } from '@/hooks/use-topic';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { TopicForm } from '@/components/topic-form';
import { updateTopicAction } from '../../actions';
import { Loader2 } from 'lucide-react';
import { use } from 'react';

export default function EditTopicPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const { topic, isLoading, error } = useTopic(id);
  const updateTopicWithId = updateTopicAction.bind(null, id);

  if (!id || isLoading) {
    return (
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 border-b">
          <SidebarToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !topic) {
    notFound();
  }

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
              href={`/topics/${topic.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Topic
            </Link>
          </div>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Topic</h1>
            <p className="text-muted-foreground">
              Update the details for &ldquo;{topic.title}&rdquo;.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border rounded-lg p-6">
            <TopicForm mode="edit" topic={topic} action={updateTopicWithId} />
          </div>
        </div>
      </main>
    </div>
  );
}
