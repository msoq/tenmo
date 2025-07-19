'use client';

interface PhraseProps {
  text: string;
}

export function Phrase({ text }: PhraseProps) {
  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <p className="text-lg">{text}</p>
    </div>
  );
}