'use client';

import { useState, useMemo } from 'react';
import type { Topic } from '@/lib/db/schema';
import { useTopics } from '@/hooks/use-topics';
import { TopicCard } from '@/components/topic-card';
import { TopicDialog } from '@/components/topic-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TopicGridProps {
  className?: string;
}

export function TopicGrid({ className }: TopicGridProps) {
  const { topics, isLoading, error } = useTopics({ activeOnly: true });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultySortOrder, setDifficultySortOrder] = useState<string>('none');

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTopic(null);
  };

  // Get unique categories and levels for filter options
  const { uniqueCategories, uniqueLevels } = useMemo(() => {
    if (!topics) return { uniqueCategories: [], uniqueLevels: [] };
    
    const categories = Array.from(new Set(topics.map(topic => topic.category))).sort();
    const levels = Array.from(new Set(topics.map(topic => topic.level))).sort();
    
    return { uniqueCategories: categories, uniqueLevels: levels };
  }, [topics]);

  // Filter and sort topics
  const filteredAndSortedTopics = useMemo(() => {
    if (!topics) return [];

    const filtered = topics.filter(topic => {
      const levelMatch = levelFilter === 'all' || topic.level === levelFilter;
      const categoryMatch = categoryFilter === 'all' || topic.category === categoryFilter;
      return levelMatch && categoryMatch;
    });

    // Sort by difficulty if specified
    if (difficultySortOrder === 'asc') {
      filtered.sort((a, b) => a.difficulty - b.difficulty);
    } else if (difficultySortOrder === 'desc') {
      filtered.sort((a, b) => b.difficulty - a.difficulty);
    }

    return filtered;
  }, [topics, levelFilter, categoryFilter, difficultySortOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading topics...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">
          Failed to load topics. Please try again later.
        </p>
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No topics available at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Level:</span>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32" aria-label="Filter by level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueLevels.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by Difficulty:</span>
          <Select value={difficultySortOrder} onValueChange={setDifficultySortOrder}>
            <SelectTrigger className="w-36" aria-label="Sort by difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default</SelectItem>
              <SelectItem value="asc">Easiest First</SelectItem>
              <SelectItem value="desc">Hardest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedTopics.length} of {topics.length} topics
        </p>
      </div>

      {/* Topics Grid */}
      {filteredAndSortedTopics.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No topics match your current filters.
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
          {filteredAndSortedTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={handleTopicClick}
            />
          ))}
        </div>
      )}

      <TopicDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="view"
        topic={selectedTopic || undefined}
      />
    </>
  );
}