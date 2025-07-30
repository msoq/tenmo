'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useTopic } from '@/hooks/use-topic';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LEVEL_COLORS, LEVEL_DESCRIPTIONS } from '@/lib/constants';
import { createDifficultyStars } from '@/lib/topics/utils';
import { Edit2, Loader2 } from 'lucide-react';

export default function TopicPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { topic, isLoading, error } = useTopic(id);

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
        <div className="flex-1" />
        <Link href={`/topics/${topic.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit2 className="size-4 mr-2" />
            Edit Topic
          </Button>
        </Link>
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

          {/* Topic content */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {topic.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium',
                    LEVEL_COLORS[topic.level as keyof typeof LEVEL_COLORS],
                  )}
                >
                  {topic.level}
                </span>
                <div className="flex items-center gap-1">
                  {createDifficultyStars(topic.difficulty, 'lg')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Proficiency Level
                  </h3>
                  <p className="text-base">
                    {
                      LEVEL_DESCRIPTIONS[
                        topic.level as keyof typeof LEVEL_DESCRIPTIONS
                      ]
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Category
                  </h3>
                  <p className="text-base capitalize">{topic.category}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Difficulty Rating
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {createDifficultyStars(topic.difficulty, 'lg')}
                    </div>
                    <span className="text-base text-muted-foreground">
                      ({topic.difficulty}/5)
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Status
                  </h3>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                      topic.isActive
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200',
                    )}
                  >
                    {topic.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {topic.createdAt && (
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Created{' '}
                  {new Date(topic.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
