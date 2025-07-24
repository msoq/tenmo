import { Settings } from 'lucide-react';

export function PhraseInitialInstructions() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-foreground">
          Welcome to Language Practice
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Start practicing by clicking the settings button{' '}
          <Settings className="w-4 h-4 inline mx-1" /> in the top-left corner to
          set up your language preferences, topic, and difficulty level.
        </p>
      </div>
    </div>
  );
}
