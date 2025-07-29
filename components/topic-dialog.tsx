'use client';

import type { Topic } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type TopicDialogMode = 'view' | 'edit' | 'create';

interface TopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TopicDialogMode;
  topic?: Topic;
  onSave?: (topic: Partial<Topic>) => void;
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
          'text-lg',
          i < difficulty ? 'text-yellow-400' : 'text-gray-300',
        )}
      >
        ★
      </span>,
    );
  }
  return stars;
};

const levelDescriptions = {
  A1: 'Beginner - Basic words and phrases',
  A2: 'Elementary - Simple conversations',
  B1: 'Intermediate - Complex topics',
  B2: 'Upper Intermediate - Detailed discussions',
  C1: 'Advanced - Complex abstract topics',
  C2: 'Proficient - Native-like fluency',
} as const;

export function TopicDialog({
  open,
  onOpenChange,
  mode,
  topic,
  onSave,
}: TopicDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'view':
        return topic?.title || 'Topic Details';
      case 'edit':
        return 'Edit Topic';
      case 'create':
        return 'Create Topic';
      default:
        return 'Topic';
    }
  };

  const renderViewMode = () => {
    if (!topic) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-semibold mb-2">{topic.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {topic.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium',
                levelColors[topic.level as keyof typeof levelColors],
              )}
            >
              {topic.level}
            </span>
            <div className="flex items-center gap-1">
              {difficultyStars(topic.difficulty)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                PROFICIENCY LEVEL
              </h4>
              <p className="text-sm">
                {
                  levelDescriptions[
                    topic.level as keyof typeof levelDescriptions
                  ]
                }
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                CATEGORY
              </h4>
              <p className="text-sm capitalize">{topic.category}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                DIFFICULTY RATING
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {difficultyStars(topic.difficulty)}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({topic.difficulty}/5)
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                STATUS
              </h4>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
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
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
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
    );
  };

  const renderEditMode = () => {
    // TODO: Implement edit mode in future
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Edit mode coming soon...</p>
      </div>
    );
  };

  const renderCreateMode = () => {
    // TODO: Implement create mode in future
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Create mode coming soon...</p>
      </div>
    );
  };

  const renderContent = () => {
    switch (mode) {
      case 'view':
        return renderViewMode();
      case 'edit':
        return renderEditMode();
      case 'create':
        return renderCreateMode();
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (mode) {
      case 'view':
        return (
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        );
      case 'edit':
      case 'create':
        return (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave?.({})}>
              {mode === 'create' ? 'Create Topic' : 'Save Changes'}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>{renderFooter()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
