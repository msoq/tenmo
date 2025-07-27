'use client';

import { SidebarToggle } from '@/components/sidebar-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Topic } from '@/lib/db/schema';
import { useTopics } from '@/hooks/use-topics';

const levelColors = {
  A1: 'bg-green-100 text-green-800',
  A2: 'bg-green-200 text-green-900',
  B1: 'bg-yellow-100 text-yellow-800',
  B2: 'bg-yellow-200 text-yellow-900',
  C1: 'bg-red-100 text-red-800',
  C2: 'bg-red-200 text-red-900',
};

function Badge({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary';
}) {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses =
    variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground'
      : 'bg-primary text-primary-foreground';

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{topic.title}</CardTitle>
          <Badge
            className={levelColors[topic.level as keyof typeof levelColors]}
          >
            {topic.level}
          </Badge>
        </div>
        <CardDescription>{topic.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{topic.category}</Badge>
            <span className="text-sm text-muted-foreground">
              Difficulty: {topic.difficulty}/5
            </span>
          </div>
          <Link
            href={`/phrases?topic=${encodeURIComponent(topic.title)}&level=${topic.level}`}
          >
            <Button size="sm">Start Practice</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TopicsPage() {
  const { topics, isLoading, error } = useTopics({ limit: 50 });

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
        <SidebarToggle />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              Loading topics...
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-destructive">
              Error: {error.message || 'An error occurred'}
            </div>
          </div>
        )}

        {!isLoading && !error && topics.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              No topics found
            </div>
          </div>
        )}

        {!isLoading && !error && topics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
