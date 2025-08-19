# Enhancement Plan: Include Topic Descriptions in Phrase Generation

## Current State
The phrase generation system currently only uses topic titles when generating phrases, missing valuable context that topic descriptions could provide for more accurate and relevant phrase generation.

## Problem Analysis
1. **Topics have descriptions**: The database schema includes both `title` and `description` fields for topics
2. **Descriptions are ignored**: The API route only passes `topics.map((t) => t.title)` to the AI prompt
3. **Limited context**: The AI prompt only receives topic titles, missing rich contextual information from descriptions
4. **Schema inconsistency**: `GeneratePhrasePromptParams` uses `requestBodySchema_old` while `requestBodySchema` exists but is unused

## Proposed Changes

### 1. Schema Cleanup (`lib/ai/prompts/phrase/generate-phrases.ts`)
- Remove `requestBodySchema_old` completely
- Update `requestBodySchema` to replace the old schema:
  ```typescript
  export const requestBodySchema = z.object({
    from: z.string().min(1).max(50),
    to: z.string().min(1).max(50),
    topics: z.array(z.object({
      title: z.string().min(1).max(200),
      description: z.string().default('') // Handle missing descriptions like instruction
    })).min(1).max(5),
    count: z.coerce.number().int().min(1).max(50).default(10),
    instruction: z.string().max(500).default('None'),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
    phraseLength: z.coerce.number().int().min(1).max(20).default(5),
  });
  ```
- Change `GeneratePhrasePromptParams` to use `requestBodySchema` instead of the old schema

### 2. Enhance Prompt Generation (`lib/ai/prompts/phrase/generate-phrases.ts`)
- Update `generatePhrasesPrompt()` to format topics with descriptions:
  ```typescript
  const formatTopics = (topics: {title: string, description: string}[]) => {
    return topics
      .map(topic => topic.description 
        ? `${topic.title}: ${topic.description}`
        : topic.title
      )
      .join(', ');
  };
  ```
- Handle missing descriptions gracefully (same as missing instruction)

### 3. Update API Route (`app/(phrases)/api/phrases/route.ts`)
- Change from: `topics: topics.map((t) => t.title)`
- To: `topics: topics.map(t => ({ title: t.title, description: t.description || '' }))`
- Pass full topic objects with descriptions to `generatePhrases()`

## Implementation Steps

1. **Phase 1**: Schema cleanup and type updates
   - Remove `requestBodySchema_old` entirely
   - Replace `requestBodySchema` with topic object structure
   - Update `GeneratePhrasePromptParams` to use the corrected schema
   - Ensure strong typing throughout

2. **Phase 2**: Prompt generation enhancement
   - Add topic formatting function to handle title + description
   - Update prompt template to use formatted topics
   - Handle missing descriptions gracefully (default to empty string)

3. **Phase 3**: API route integration
   - Update route handler to pass full topic objects instead of titles only
   - Replace `.map((t) => t.title)` with full object mapping
   - Test with existing data to ensure compatibility

## Expected Benefits
- **Schema consistency**: Fixes the current mismatch between schemas and eliminates unused code
- **Improved accuracy**: AI will have more context about what each topic covers through descriptions
- **Better relevance**: Generated phrases will be more aligned with specific topic scope
- **Enhanced quality**: Descriptions provide nuanced understanding of topic boundaries
- **Minimal token impact**: Topic descriptions are limited by API constraints, negligible cost increase

## Risk Assessment
- **Very low risk**: Fixes existing inconsistency rather than creating new issues
- **Strong typing**: TypeScript will catch any missed integration points during development
- **Graceful degradation**: Missing descriptions handled same way as missing instructions
- **No breaking changes**: Internal refactoring with improved data flow

## Files to Modify
1. `lib/ai/prompts/phrase/generate-phrases.ts` - Core logic updates
2. `app/(phrases)/api/phrases/route.ts` - API integration changes

---
**Ready for Implementation**: This plan fixes existing schema inconsistency while enhancing phrase generation with richer topic context through descriptions. All questions resolved with confirmed technical approach.
