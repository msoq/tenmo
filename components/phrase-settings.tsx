'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PhraseParams {
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
  phrase: string; // Original phrase text
  userTranslation: string; // User's translation input
  feedback?: string; // AI feedback on translation
  isCorrect?: boolean; // Whether translation is correct
  isLoading?: boolean; // Loading state for individual phrase
  isSubmitted?: boolean; // Whether user has submitted translation
}

interface PhraseSettingsProps {
  params: PhraseParams;
  onParamsChange: (params: PhraseParams) => void;
}

export function PhraseSettings({
  params,
  onParamsChange,
}: PhraseSettingsProps) {
  const handleInputChange = (
    field: keyof PhraseParams,
    value: string | number,
  ) => {
    onParamsChange({ ...params, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Learning Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">From Language</Label>
            <Input
              id="from"
              value={params.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              placeholder="Spanish"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To Language</Label>
            <Input
              id="to"
              value={params.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="English"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={params.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              placeholder="travel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">CEFR Level</Label>
            <Select
              value={params.level}
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
            <Label htmlFor="count">Number of Phrases</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="50"
              value={params.count}
              onChange={(e) =>
                handleInputChange(
                  'count',
                  Number.parseInt(e.target.value) || 10,
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phraseLength">Words per Phrase</Label>
            <Input
              id="phraseLength"
              type="number"
              min="1"
              max="20"
              value={params.phraseLength}
              onChange={(e) =>
                handleInputChange(
                  'phraseLength',
                  Number.parseInt(e.target.value) || 5,
                )
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="instruction">Additional Instructions</Label>
          <Input
            id="instruction"
            value={params.instruction}
            onChange={(e) => handleInputChange('instruction', e.target.value)}
            placeholder="Any specific requirements..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
