import Link from 'next/link';
import type { Topic } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { LEVEL_COLORS } from '@/lib/constants';
import { createDifficultyStars } from '@/lib/topics/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TopicCardProps {
  topic: Topic;
  className?: string;
}

export function TopicCard({ topic, className }: TopicCardProps) {
  return (
    <Link href={`/topics/${topic.id}`} className={cn('block', className)}>
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] h-full',
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">
              {topic.title}
            </CardTitle>
            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
                  LEVEL_COLORS[topic.level as keyof typeof LEVEL_COLORS],
                )}
              >
                {topic.level}
              </span>
              <div className="flex items-center gap-0.5">
                {createDifficultyStars(topic.difficulty, 'sm')}
              </div>
            </div>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {topic.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{topic.category}</span>
            <span>Difficulty: {topic.difficulty}/5</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
