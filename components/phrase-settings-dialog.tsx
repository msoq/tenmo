'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import equal from 'fast-deep-equal';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageSelect } from '@/components/ui/language-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useUserPhrasesSettings } from '@/hooks/use-user-phrases-settings';
import {
  Slider,
  SliderTrack,
  SliderFillTrack,
  SliderThumb,
} from '@/components/ui/slider';

export interface PhraseSettings {
  from: string;
  to: string;
  topic: string;
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
  topic: '',
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
  const [pendingSettings, setPendingSettings] = useState<PhraseSettings | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof PhraseSettings, value: string | number) => {
      if (pendingSettings) {
        setPendingSettings({ ...pendingSettings, [field]: value });
      }
    },
    [pendingSettings],
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
  }, []);

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
                onValueChange={(value) => handleInputChange('from', value)}
                placeholder="Select source language..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Translate To</Label>
              <LanguageSelect
                value={pendingSettings?.to || DEFAULT_SETTINGS.to}
                onValueChange={(value) => handleInputChange('to', value)}
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
                  <SelectItem value="A1">A1 - Beginner</SelectItem>
                  <SelectItem value="A2">A2 - Elementary</SelectItem>
                  <SelectItem value="B1">B1 - Intermediate</SelectItem>
                  <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                  <SelectItem value="C1">C1 - Advanced</SelectItem>
                  <SelectItem value="C2">C2 - Proficient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={pendingSettings?.topic || DEFAULT_SETTINGS.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-6">
                <Label htmlFor="count">Number of Phrases</Label>
                <span className="text-sm text-muted-foreground">
                  {pendingSettings?.count || DEFAULT_SETTINGS.count}
                </span>
              </div>
              <Slider
                id="count"
                minValue={10}
                maxValue={30}
                step={1}
                value={pendingSettings?.count || DEFAULT_SETTINGS.count}
                onChange={(value) =>
                  handleInputChange('count', value as number)
                }
              >
                <SliderTrack>
                  <SliderFillTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-6">
                <Label htmlFor="phraseLength">Words per Phrase</Label>
                <span className="text-sm text-muted-foreground">
                  {pendingSettings?.phraseLength ??
                    DEFAULT_SETTINGS.phraseLength}
                </span>
              </div>
              <Slider
                id="phraseLength"
                minValue={5}
                maxValue={20}
                step={1}
                value={
                  pendingSettings?.phraseLength ?? DEFAULT_SETTINGS.phraseLength
                }
                onChange={(value) =>
                  handleInputChange('phraseLength', value as number)
                }
              >
                <SliderTrack>
                  <SliderFillTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
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
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
