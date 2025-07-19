'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Phrase as PhraseType } from '@/components/phrase-settings';
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react';

interface PhraseProps {
  phrase: PhraseType;
  onTranslationChange: (id: string, translation: string) => void;
  onSubmitTranslation: (id: string) => void;
}

export function Phrase({
  phrase,
  onTranslationChange,
  onSubmitTranslation,
}: PhraseProps) {
  const [isExpanded, setIsExpanded] = useState(
    phrase.userTranslation !== '' || phrase.isSubmitted,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current && !phrase.isSubmitted) {
      inputRef.current.focus();
    }
  }, [isExpanded, phrase.isSubmitted]);

  const handleTranslationChange = (value: string) => {
    onTranslationChange(phrase.id, value);
  };

  const handleSubmit = () => {
    if (phrase.userTranslation.trim()) {
      onSubmitTranslation(phrase.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
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
          ? `Focus to translate: ${phrase.phrase}`
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-lg font-medium">{phrase.phrase}</p>
        </div>
        <div className="ml-3">{getStatusIcon()}</div>
      </div>

      {/* Translation Input Section */}
      {isExpanded && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              id={`translation-${phrase.id}`}
              value={phrase.userTranslation}
              onChange={(e) => handleTranslationChange(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={phrase.isSubmitted}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            />
            {!phrase.isSubmitted && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                disabled={!phrase.userTranslation.trim() || phrase.isLoading}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
