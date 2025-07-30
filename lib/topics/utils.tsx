import { cn } from '@/lib/utils';

/**
 * Creates difficulty stars component with configurable size
 * @param difficulty - Difficulty level from 1 to 5
 * @param size - Size variant: 'sm' for small text, 'lg' for large text
 * @returns Array of star JSX elements
 */
export const createDifficultyStars = (
  difficulty: number,
  size: 'sm' | 'lg' = 'sm',
) => {
  const stars = [];
  const textSize = size === 'sm' ? 'text-sm' : 'text-lg';

  for (let i = 0; i < 5; i++) {
    const isFilledStar = i < difficulty;
    stars.push(
      <span
        key={`star-${difficulty}-${i}`}
        className={cn(
          textSize,
          isFilledStar ? 'text-yellow-400' : 'text-gray-300',
        )}
        style={{
          color: isFilledStar ? '#facc15' : '#d1d5db', // Fallback colors
        }}
      >
        ★
      </span>,
    );
  }
  return stars;
};
