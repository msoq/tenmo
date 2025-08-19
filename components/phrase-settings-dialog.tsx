'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelect } from '@/components/ui/language-select';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTopics } from '@/hooks/use-topics';
import { useUserPhrasesSettings } from '@/hooks/use-user-phrases-settings';
import { LEVEL_OPTIONS } from '@/lib/constants';
import equal from 'fast-deep-equal';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface PhraseSettings {
  from: string;
  to: string;
  topicIds: string[];
  count: number;
  instruction: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  phraseLength: number;
}

// TODO: move to a better place
export interface Phrase {
  id: string; // Unique identifier for each phrase
  text: string; // Original phrase text
  userTranslation: string; // User's translation input
  feedback?: string; // AI feedback on translation
  isCorrect?: boolean; // Whether translation is correct
  isLoading?: boolean; // Loading state for individual phrase
  isSubmitted?: boolean; // Whether user has submitted translation
  suggestions?: string[]; // Alternative translation suggestions when incorrect
}

// API request/response interfaces for feedback endpoint
export interface FeedbackRequest {
  id: string;
  text: string;
  userTranslation: string;
  from: string;
  to: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface FeedbackResponse {
  id: string;
  feedback: string;
  isCorrect: boolean;
  suggestions?: string[];
}

// Default params for when settings don't exist
const DEFAULT_SETTINGS: PhraseSettings = {
  from: '',
  to: '',
  topicIds: [],
  count: 10,
  instruction: '',
  level: 'A1',
  phraseLength: 5,
};

interface PhraseSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhraseSettingsDialog({
  open,
  onOpenChange,
}: PhraseSettingsDialogProps) {
  const { settings, saveSettings, isLoading } = useUserPhrasesSettings();
  const { topics, isLoading: topicsLoading } = useTopics({ activeOnly: true });
  const [pendingSettings, setPendingSettings] = useState<PhraseSettings | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof PhraseSettings, value: string | number | string[]) => {
      setPendingSettings((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
    },
    [],
  );

  const handleFromLanguageChange = useCallback(
    (value: string) => handleInputChange('from', value),
    [handleInputChange],
  );

  const handleToLanguageChange = useCallback(
    (value: string) => handleInputChange('to', value),
    [handleInputChange],
  );

  const handleTopicsChange = useCallback(
    (value: string[]) => handleInputChange('topicIds', value),
    [handleInputChange],
  );

  // Initialize settings when dialog opens
  useEffect(() => {
    if (open && !isLoading) {
      const currentSettings = settings || DEFAULT_SETTINGS;
      setPendingSettings(currentSettings);
    }
  }, [open, settings, isLoading]);

  // Check if there are unsaved changes
  const hasChanges = pendingSettings && !equal(settings, pendingSettings);

  const handleSave = useCallback(async () => {
    if (!pendingSettings || !hasChanges) return;

    setIsSaving(true);
    try {
      await saveSettings(pendingSettings);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsSaving(false);
    }
  }, [pendingSettings, hasChanges, saveSettings, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Create topic options from real topics data
  const topicOptions = topics.map((topic) => ({
    value: topic.id,
    label: topic.title,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Language Learning Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="from">Translate From</Label>
              <LanguageSelect
                value={pendingSettings?.from || DEFAULT_SETTINGS.from}
                onValueChange={handleFromLanguageChange}
                placeholder="Select source language..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Translate To</Label>
              <LanguageSelect
                value={pendingSettings?.to || DEFAULT_SETTINGS.to}
                onValueChange={handleToLanguageChange}
                placeholder="Select target language..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={pendingSettings?.level || DEFAULT_SETTINGS.level}
                onValueChange={(value) => handleInputChange('level', value)}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="topics">Topics</Label>
              <MultiSelect
                options={topicOptions}
                value={pendingSettings?.topicIds || DEFAULT_SETTINGS.topicIds}
                onValueChange={handleTopicsChange}
                placeholder="Select topics..."
                disabled={topicsLoading}
              />
            </div>
            <div className="space-y-10">
              <div className="flex items-center justify-between mb-6">
                <Label htmlFor="count">Number of Phrases</Label>
              </div>
              <Slider
                id="count"
                label={(value) => value}
                min={10}
                max={30}
                step={1}
                value={[pendingSettings?.count || DEFAULT_SETTINGS.count]}
                onValueChange={(value) => handleInputChange('count', value[0])}
              />
            </div>
            <div className="space-y-10">
              <div className="flex items-center justify-between mb-6">
                <Label htmlFor="phraseLength">Words per Phrase</Label>
              </div>
              <Slider
                id="phraseLength"
                label={(value) => value}
                min={5}
                max={20}
                step={1}
                value={[
                  pendingSettings?.phraseLength ??
                    DEFAULT_SETTINGS.phraseLength,
                ]}
                onValueChange={(value) =>
                  handleInputChange('phraseLength', value[0])
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instruction">Additional Instructions</Label>
            <Input
              id="instruction"
              value={
                pendingSettings?.instruction || DEFAULT_SETTINGS.instruction
              }
              onChange={(e) => handleInputChange('instruction', e.target.value)}
              placeholder="Any specific requirements..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[125px]"
          >
            {isSaving || !open ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
