import type { Topic } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
  className?: string;
}

const levelColors = {
  A1: 'bg-green-100 text-green-800 border-green-200',
  A2: 'bg-green-100 text-green-800 border-green-200',
  B1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  B2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  C1: 'bg-red-100 text-red-800 border-red-200',
  C2: 'bg-red-100 text-red-800 border-red-200',
} as const;

const difficultyStars = (difficulty: number) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span
        key={`star-${difficulty}-${i}`}
        className={cn(
          'text-sm',
          i < difficulty ? 'text-yellow-400' : 'text-gray-300'
        )}
      >
        ★
      </span>
    );
  }
  return stars;
};

export function TopicCard({ topic, onClick, className }: TopicCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={() => onClick(topic)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
                levelColors[topic.level as keyof typeof levelColors]
              )}
            >
              {topic.level}
            </span>
            <div className="flex items-center gap-0.5">
              {difficultyStars(topic.difficulty)}
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
  );
}