'use client';

import { useMemo } from 'react';
import * as React from 'react';
import ISO6391 from 'iso-639-1';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Get all languages and sort them alphabetically by English name
const getAllLanguages = (): Language[] => {
  return ISO6391.getAllCodes()
    .map((code) => ({
      code,
      name: ISO6391.getName(code),
      nativeName: ISO6391.getNativeName(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export function LanguageSelect({
  value,
  onValueChange,
  placeholder = 'Select a language...',
  disabled = false,
  className,
}: LanguageSelectProps) {
  const allLanguages = useMemo(() => getAllLanguages(), []);

  // Get display text for selected language
  const selectedLanguage = allLanguages.find((lang) => lang.code === value);
  const displayText = selectedLanguage
    ? selectedLanguage.name === selectedLanguage.nativeName
      ? selectedLanguage.name
      : `${selectedLanguage.name} (${selectedLanguage.nativeName})`
    : undefined;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder}>
          {displayText}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80" position="popper" sideOffset={4}>
        {allLanguages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.name === language.nativeName
              ? language.name
              : `${language.name} (${language.nativeName})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}