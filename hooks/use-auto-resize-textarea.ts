import { useCallback, useEffect, useRef } from 'react';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Set initial height
    textarea.style.height = `${minHeight}px`;

    // Handle resize on content change
    const handleInput = () => adjustHeight();
    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('input', handleInput);
    };
  }, [adjustHeight, minHeight]);

  return { textareaRef, adjustHeight };
}
