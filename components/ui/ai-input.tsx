'use client';

import { CornerRightUp, Loader2, Mic, Square } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea';
import { Button } from './button';
import { useUserPhrasesSettings } from '@/hooks/use-user-phrases-settings';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

interface AIInputProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string) => boolean;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function AIInput({
  id = 'ai-input',
  placeholder = 'Type your message...',
  minHeight = 52,
  maxHeight = 200,
  onSubmit,
  className,
  disabled = false,
  isLoading = false,
}: AIInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });
  const [inputValue, setInputValue] = useState('');

  // Get user language settings for transcription hint
  const { settings } = useUserPhrasesSettings();

  // Use the speech-to-text hook
  const { isRecording, isTranscribing, toggleRecording } = useSpeechToText({
    language: settings?.to || undefined,
    onTranscript: (text) => {
      setInputValue(text);
      adjustHeight();
      // Focus textarea after transcription
      textareaRef.current?.focus();
    },
  });

  const handleReset = () => {
    if (!inputValue.trim()) return;

    const isSubmitted = onSubmit?.(inputValue);

    if (isSubmitted) {
      setInputValue('');
      adjustHeight(true);
    }
  };

  return (
    <div className={cn('w-full py-4', className)}>
      <div className="relative max-w-xl w-full mx-auto">
        <Textarea
          id={id}
          placeholder={placeholder}
          className={cn(
            'max-w-xl bg-black/5 dark:bg-white/5 rounded-3xl pl-6 pr-16',
            'placeholder:text-black/50 dark:placeholder:text-white/50',
            'border-none ring-black/20 dark:ring-white/20',
            'text-black dark:text-white text-wrap',
            'overflow-y-auto resize-none',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'transition-[height] duration-100 ease-out',
            'leading-[1.2] py-[16px]',
            `min-h-[${minHeight}px]`,
            `max-h-[${maxHeight}px]`,
            '[&::-webkit-resizer]:hidden', // Скрываем ресайзер
          )}
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleReset();
            }
          }}
          disabled={disabled || isLoading}
        />

        {/* Mic button */}
        <Button
          onClick={toggleRecording}
          type="button"
          size="xs"
          variant="link"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1 right-10 transition-all duration-200',
            isRecording && 'ring-2 ring-red-500',
          )}
          disabled={disabled || isLoading || isTranscribing}
        >
          {isTranscribing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isRecording ? (
            <Square className="w-3 h-3 text-red-500 fill-red-500" />
          ) : (
            <Mic className="w-4 h-4 text-black/70 dark:text-white/70" />
          )}
        </Button>

        {/* Submit button */}
        <Button
          onClick={handleReset}
          type="button"
          size="xs"
          variant="link"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-3',
            'rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1',
            'transition-all duration-200',
            'scale-100',
          )}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CornerRightUp className="w-4 h-4 text-black/70 dark:text-white/70" />
          )}
        </Button>
      </div>
    </div>
  );
}
