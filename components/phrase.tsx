'use client';

import { useState } from 'react';
import type { Phrase as PhraseType } from '@/components/phrase-settings';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { AIInput } from './ui/ai-input';

interface PhraseProps {
  phrase: PhraseType;
  onSubmitTranslation: (id: string, translation: string) => void;
}

export function Phrase({ phrase, onSubmitTranslation }: PhraseProps) {
  const [isExpanded, setIsExpanded] = useState(
    phrase.userTranslation !== '' || phrase.isSubmitted,
  );

  const handleSubmit = (value: string) => {
    if (!phrase.isLoading && !phrase.isSubmitted) {
      onSubmitTranslation(phrase.id, value);
    }
  };

  const handleCardFocus = () => {
    if (!phrase.isSubmitted && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    // Only handle keyboard events if the target is the card itself, not the input
    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleCardFocus();
    }
  };

  const getStatusIcon = () => {
    if (phrase.isLoading) {
      return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
    }
    if (phrase.isSubmitted && phrase.isCorrect === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (phrase.isSubmitted && phrase.isCorrect === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const getCardClassName = () => {
    let baseClass =
      'p-4 bg-card rounded-lg border transition-all duration-200 ';
    if (phrase.isSubmitted && phrase.isCorrect === true) {
      baseClass += 'border-green-200 bg-green-50';
    } else if (phrase.isSubmitted && phrase.isCorrect === false) {
      baseClass += 'border-red-200 bg-red-50';
    } else if (!isExpanded && !phrase.isSubmitted) {
      baseClass +=
        'border-border cursor-pointer hover:border-primary/50 hover:bg-accent/5';
    } else {
      baseClass += 'border-border';
    }
    return baseClass;
  };

  return (
    // biome-ignore lint/nursery/noStaticElementInteractions: TODO: fix later
    <div
      className={getCardClassName()}
      onClick={handleCardFocus}
      onFocus={handleCardFocus}
      onKeyDown={handleCardKeyDown}
      tabIndex={!phrase.isSubmitted && !isExpanded ? 0 : -1}
      role={!phrase.isSubmitted && !isExpanded ? 'button' : undefined}
      aria-label={
        !phrase.isSubmitted && !isExpanded
          ? `Focus to translate: ${phrase.text}`
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-lg font-medium">{phrase.text}</p>
        </div>
        <div className="ml-3">{getStatusIcon()}</div>
      </div>

      {/* Translation Input Section */}
      {isExpanded && (
        <div className="space-y-3">
          <div
            onClick={(e) => e.stopPropagation()}
            role="textbox"
            tabIndex={-1}
          >
            <AIInput
              id={`translation-${phrase.id}`}
              onSubmit={handleSubmit}
              minHeight={52}
              maxHeight={120}
              className="w-full"
              disabled={phrase.isSubmitted}
              isLoading={phrase.isLoading}
            />
          </div>

          {/* Feedback Section */}
          {phrase.feedback && (
            <div
              className={`p-3 rounded-md ${
                phrase.isCorrect
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              <p className="text-sm">{phrase.feedback}</p>

              {/* Suggestions for incorrect translations */}
              {!phrase.isCorrect &&
                phrase.suggestions &&
                phrase.suggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-red-300">
                    <p className="text-xs font-medium mb-1">Suggestions:</p>
                    <ul className="text-xs space-y-1">
                      {phrase.suggestions.map((suggestion, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: accepted
                        <li key={index} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
