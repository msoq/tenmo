import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Settings } from 'lucide-react';
import { Button } from './ui/button';

interface PhraseSettingsToggleProps {
  showSettings: boolean;
  onToggle: () => void;
}

export function PhraseSettingsToggle({
  showSettings,
  onToggle,
}: PhraseSettingsToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="phrase-settings-toggle-button"
          onClick={onToggle}
          variant="outline"
          className="md:px-2 md:h-fit"
        >
          <Settings size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">
        {showSettings ? 'Hide Settings' : 'Show Settings'}
      </TooltipContent>
    </Tooltip>
  );
}
