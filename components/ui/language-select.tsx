'use client';

import { useMemo, memo } from 'react';
import ISO6391 from 'iso-639-1';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Language {
  code: string;
  text: string;
}

interface LanguageSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Pre-calculate all languages once
const ALL_LANGUAGES: Language[] = ISO6391.getAllCodes()
  .map((code) => {
    const name = ISO6391.getName(code);
    const nativeName = ISO6391.getNativeName(code);

    return {
      code,
      text: name === nativeName ? name : `${name} (${nativeName})`,
    };
  })
  .sort((a, b) => a.text.localeCompare(b.text));

const PureLanguageSelect = ({
  value,
  onValueChange,
  placeholder = 'Select a language...',
  disabled = false,
  className,
}: LanguageSelectProps) => {
  const text = useMemo(() => {
    if (!value) return undefined;

    return ALL_LANGUAGES.find((lang) => lang.code === value)?.text;
  }, [value]);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>{text}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80" position="popper" sideOffset={4}>
        {ALL_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const LanguageSelect = memo(PureLanguageSelect);
