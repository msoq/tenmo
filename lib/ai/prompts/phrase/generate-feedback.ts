import { generateObject } from 'ai';
import z from 'zod';
import { aiProvider } from '../../providers';

// Request schema using topicId
export const generateFeedbackBodySchema = z.object({
  topicId: z.string().uuid('Invalid topic ID'),
  userTranslation: z
    .string()
    .min(1, 'User translation is required')
    .max(200, 'User translation must be 200 characters or less'),
  phraseText: z
    .string()
    .min(1, 'Phrase text is required')
    .max(200, 'Phrase text must be 200 characters or less'),
});

const generateFeedbackSchema = z.object({
  feedback: z
    .string()
    .optional()
    .describe(
      'Detailed pedagogical feedback on the translation. Only provide if translation is incorrect.',
    ),
  isCorrect: z.boolean().describe('Whether the translation is correct'),
  suggestions: z
    .array(z.string())
    .optional()
    .describe('Alternative translation suggestions when incorrect'),
});

// Params with topic context for AI generation
export type GenerateFeedbackParams = {
  phraseText: string;
  userTranslation: string;
  from: string;
  to: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: {
    title: string;
    description: string;
    category: string;
    difficulty: number;
  };
};

const generateFeedbackPrompt = (params: GenerateFeedbackParams) => {
  return `You are an expert language teacher providing feedback on translation exercises.

**Student Information:**
- CEFR Level: ${params.level}
- Translating from: ${params.from}
- Translating to: ${params.to}

**Topic Context:**
- Topic: ${params.topic.title}
- Description: ${params.topic.description}
- Category: ${params.topic.category}
- Difficulty Level: ${params.topic.difficulty}/10

**Translation Exercise:**
Original phrase (${params.from}): "${params.phraseText}"
Student translation (${params.to}): "${params.userTranslation}"

**Your Task:**
Evaluate the student's translation for accuracy. The translation MUST be contextually appropriate for the topic "${params.topic.title}".

**CRITICAL REQUIREMENT:**
The translation should STRICTLY align with the topic context. Verify that:
- The translation uses vocabulary and expressions relevant to "${params.topic.title}"
- The meaning fits within the scope of: "${params.topic.description}"
- Domain-specific terms are used appropriately for the ${params.topic.category} category

**IMPORTANT Instructions:**
- If the translation is CORRECT: Return only isCorrect: true (no feedback or suggestions needed)
- If the translation has ONLY punctuation/typo issues: Return isCorrect: true BUT include feedback about the minor issues
- If the translation is INCORRECT (meaning/grammar errors): Provide direct, concise but positive feedback without too much praise or encouragement

**Evaluation Criteria:**
1. **Meaning & Grammar** (Critical): These determine if answer is correct/incorrect
2. **Punctuation & Typos** (Minor): These don't affect correctness but should be noted in feedback
   - Missing or incorrect punctuation marks
   - Minor spelling errors that don't change meaning
   - Capitalization issues
   
**Guidelines for Feedback:**
1. **Be Direct**: State what's wrong clearly and concisely
2. **No Praise**: Avoid phrases like "good attempt", "well done", "keep trying"
3. **Distinguish Error Types**: 
   - For meaning/grammar errors: Mark as incorrect
   - For punctuation/typos only: Mark as correct but provide feedback like "Correct translation. Note: [specific punctuation/typo issue]"
4. **CEFR-Appropriate**: Adjust technical language based on ${params.level} level
5. **Topic Compliance**: Flag if translation doesn't match the topic context of "${params.topic.title}"
6. **Domain Vocabulary**: Ensure appropriate use of ${params.topic.category}-specific terminology

**Feedback Style for Incorrect Translations:**
- For A1/A2: Simple, direct corrections focusing on basic errors
- For B1/B2: Clear explanations of grammar or vocabulary mistakes
- For C1/C2: Precise feedback on nuance, style, or cultural context errors

**Response Format:**
- isCorrect: true/false based on meaning accuracy (small typo/punctuation errors are allowed)
- feedback: Only provide if incorrect - direct explanation of the error (1-2 sentences, no praise)
- suggestions: Only provide if incorrect (max 3 alternative translations)`;
};

export const generateFeedback = async (params: GenerateFeedbackParams) => {
  const result = await generateObject({
    model: aiProvider.text.languageModel('chat-model'),
    schema: generateFeedbackSchema,
    prompt: generateFeedbackPrompt(params),
  });

  return result.object;
};
