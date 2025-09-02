'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import type { Topic } from '@/lib/db/schema';
import { LEVEL_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageSelect } from '@/components/ui/language-select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TopicFormData {
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  difficulty: number;
  fromLanguage: string;
  toLanguage: string;
}

interface TopicFormProps {
  mode: 'create' | 'edit';
  topic?: Topic;
  action: (formData: FormData) => Promise<any>;
  onSuccess?: (topic: Topic) => void;
}

export function TopicForm({ mode, topic, action, onSuccess }: TopicFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<TopicFormData>({
    title: topic?.title || '',
    description: topic?.description || '',
    level: topic?.level || 'A1',
    category: topic?.category || '',
    difficulty: topic?.difficulty || 3,
    fromLanguage: topic?.fromLanguage || '',
    toLanguage: topic?.toLanguage || '',
  });
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  // Initialize languages with browser detection for new topics
  useEffect(() => {
    if (mode === 'create' && !topic) {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      if (/^[a-z]{2}$/.test(browserLang)) {
        setFormData((prev) => ({
          ...prev,
          fromLanguage: prev.fromLanguage || browserLang,
          toLanguage: prev.toLanguage || (browserLang === 'en' ? 'es' : 'en'),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          fromLanguage: prev.fromLanguage || 'en',
          toLanguage: prev.toLanguage || 'es',
        }));
      }
    }
  }, [mode, topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrors(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('description', formData.description);
    formDataToSubmit.append('level', formData.level);
    formDataToSubmit.append('category', formData.category);
    formDataToSubmit.append('difficulty', formData.difficulty.toString());
    formDataToSubmit.append('fromLanguage', formData.fromLanguage);
    formDataToSubmit.append('toLanguage', formData.toLanguage);

    try {
      const result = await action(formDataToSubmit);
      if (result && !result.success) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          toast.error(result.error || 'Failed to save topic');
        }
      } else if (result?.success) {
        toast.success(
          mode === 'create'
            ? 'Topic created successfully!'
            : 'Topic updated successfully!',
        );

        // Invalidate SWR cache for the topic
        await mutate(`/api/topics/${result.topicId}`);

        if (onSuccess) {
          // Custom success handler if provided
          onSuccess({ id: result.topicId } as any);
        } else {
          // Default behavior: navigate to the topic page
          router.push(`/topics/${result.topicId}`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save topic. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && topic) {
      router.push(`/topics/${topic.id}`);
    } else {
      router.push('/topics');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fromLanguage">From Language</Label>
          <LanguageSelect
            value={formData.fromLanguage}
            onValueChange={(value) =>
              setFormData({ ...formData, fromLanguage: value })
            }
            placeholder="Select source language"
          />
          {errors?.fromLanguage && (
            <p className="text-sm text-destructive">{errors.fromLanguage[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="toLanguage">To Language</Label>
          <LanguageSelect
            value={formData.toLanguage}
            onValueChange={(value) =>
              setFormData({ ...formData, toLanguage: value })
            }
            placeholder="Select target language"
          />
          {errors?.toLanguage && (
            <p className="text-sm text-destructive">{errors.toLanguage[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter topic title..."
          />
          {errors?.title && (
            <p className="text-sm text-destructive">{errors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., grammar, vocabulary, conversation..."
          />
          {errors?.category && (
            <p className="text-sm text-destructive">{errors.category[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Proficiency Level</Label>
          <Select
            name="level"
            value={formData.level}
            onValueChange={(value) =>
              setFormData({ ...formData, level: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.level && (
            <p className="text-sm text-destructive">{errors.level[0]}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="difficulty">Difficulty</Label>
            <span className="text-sm text-muted-foreground">
              {formData.difficulty}/5
            </span>
          </div>
          <Slider
            id="difficulty"
            name="difficulty"
            min={1}
            max={5}
            step={1}
            value={[formData.difficulty]}
            onValueChange={(value) =>
              setFormData({ ...formData, difficulty: value[0] })
            }
            className="w-full"
          />
          {errors?.difficulty && (
            <p className="text-sm text-destructive">{errors.difficulty[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe what this topic covers..."
          rows={4}
        />
        {errors?.description && (
          <p className="text-sm text-destructive">{errors.description[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          {mode === 'create' ? 'Create Topic' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
