'use client';

import { useMemo, memo, useState } from 'react';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

interface MultiSelectOption<T = string> {
  value: T;
  label: string;
}

interface MultiSelectProps<T = string> {
  options: MultiSelectOption<T>[];
  value?: T[];
  onValueChange?: (value: T[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const PureMultiSelect = <T extends string = string>({
  options,
  value = [],
  onValueChange,
  placeholder = 'Select options...',
  disabled = false,
  className,
}: MultiSelectProps<T>) => {
  const [open, setOpen] = useState(false);

  const displayText = useMemo(() => {
    if (!value || value.length === 0) return placeholder;
    if (value.length === 1) return '1 option selected';
    return `${value.length} options selected`;
  }, [value, placeholder]);

  const handleItemSelect = (itemValue: T) => {
    if (!onValueChange) return;

    if (value.includes(itemValue)) {
      // Remove item from selection
      onValueChange(value.filter((v) => v !== itemValue));
    } else {
      // Add item to selection
      onValueChange([...value, itemValue]);
    }
    // Don't close the dropdown - keep it open for multi-selection
  };

  return (
    <Select open={open} onOpenChange={setOpen} value="">
      <SelectTrigger className={className} disabled={disabled}>
        <span className="text-sm">{displayText}</span>
      </SelectTrigger>
      <SelectContent className="max-h-80" position="popper" sideOffset={4}>
        {options.map((option) => (
          <SelectItem
            key={String(option.value)}
            value={String(option.value)}
            onSelect={(e) => {
              e.preventDefault(); // Prevent default Select behavior
            }}
            onPointerDown={(e) => {
              e.preventDefault(); // Prevent default pointer behavior
              handleItemSelect(option.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemSelect(option.value);
              }
            }}
            className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span className="absolute left-2 flex size-3.5 items-center justify-center">
              {value.includes(option.value) && <Check className="size-4" />}
            </span>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const MultiSelect = memo(PureMultiSelect) as <T extends string = string>(
  props: MultiSelectProps<T>,
) => JSX.Element;
