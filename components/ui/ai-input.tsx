'use client';

import { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea';
import { cn } from '@/lib/utils';

interface AIInputProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function AIInput({
  id = 'ai-input',
  placeholder = 'Type your message...',
  minHeight = 52,
  maxHeight = 200,
  onSubmit,
  className,
  disabled = false,
  value: controlledValue,
  onChange: controlledOnChange,
}: AIInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const [internalValue, setInternalValue] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const inputValue = controlledValue !== undefined ? controlledValue : internalValue;
  const setInputValue = controlledOnChange || setInternalValue;

  const handleReset = () => {
    if (!inputValue.trim() || disabled) return;

    if (onSubmit) {
      onSubmit(inputValue);
    }

    // Only reset if using internal state (not controlled)
    if (controlledValue === undefined) {
      setInputValue('');
      adjustHeight(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReset();
    }
  };

  const hasContent = inputValue.trim().length > 0;

  return (
    <div className={cn('relative', className)}>
      <Textarea
        id={id}
        ref={textareaRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-h-[52px] resize-none border rounded-lg px-3 py-3 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          hasContent ? 'pr-12' : 'pr-10'
        )}
        style={{ minHeight: `${minHeight}px` }}
        rows={1}
      />
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {/* Submit button - appears when typing */}
        <Button
          type="button"
          onClick={handleReset}
          disabled={!inputValue.trim() || disabled}
          size="sm"
          className={cn(
            'h-8 w-8 p-0 transition-all duration-200',
            hasContent 
              ? 'opacity-100 transform translate-x-0' 
              : 'opacity-0 transform translate-x-2 pointer-events-none'
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
        
        {/* Microphone icon - always visible when no content */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0 transition-all duration-200',
            hasContent 
              ? 'opacity-0 transform translate-x-2 pointer-events-none' 
              : 'opacity-100 transform translate-x-0'
          )}
          disabled={disabled}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}