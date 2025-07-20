import { generateObject } from 'ai';
import z from 'zod';
import { myProvider } from '../../providers';

export const generateFeedbackBodySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  text: z
    .string()
    .min(1, 'Text is required')
    .max(200, 'Text must be 200 characters or less'),
  userTranslation: z
    .string()
    .min(1, 'User translation is required')
    .max(200, 'User translation must be 200 characters or less'),
  from: z
    .string()
    .min(1, 'Source language is required')
    .max(50, 'Source language must be 50 characters or less'),
  to: z
    .string()
    .min(1, 'Target language is required')
    .max(50, 'Target language must be 50 characters or less'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
});

const generateFeedbackSchema = z.object({
  feedback: z
    .string()
    .optional()
    .describe('Detailed pedagogical feedback on the translation. Only provide if translation is incorrect.'),
  isCorrect: z.boolean().describe('Whether the translation is correct'),
  suggestions: z
    .array(z.string())
    .optional()
    .describe('Alternative translation suggestions when incorrect'),
});

type GenerateFeedbackParams = z.infer<typeof generateFeedbackBodySchema>;

const generateFeedbackPrompt = (
  params: GenerateFeedbackParams,
) => `You are an expert language teacher providing feedback on translation exercises.

**Student Information:**
- CEFR Level: ${params.level}
- Translating from: ${params.from}
- Translating to: ${params.to}

**Translation Exercise:**
Original phrase (${params.from}): "${params.text}"
Student translation (${params.to}): "${params.userTranslation}"

**Your Task:**
Evaluate the student's translation for accuracy. 

**IMPORTANT Instructions:**
- If the translation is CORRECT: Return only isCorrect: true (no feedback or suggestions needed)
- If the translation is INCORRECT: Provide direct, concise feedback without praise or encouragement

**Guidelines for Incorrect Translations:**
1. **Be Direct**: State what's wrong clearly and concisely
2. **No Praise**: Avoid phrases like "good attempt", "well done", "keep trying"
3. **Focus on Errors**: Identify specific grammar, vocabulary, or meaning issues
4. **CEFR-Appropriate**: Adjust technical language based on ${params.level} level

**Feedback Style for Incorrect Translations:**
- For A1/A2: Simple, direct corrections focusing on basic errors
- For B1/B2: Clear explanations of grammar or vocabulary mistakes
- For C1/C2: Precise feedback on nuance, style, or cultural context errors

**Response Format:**
- isCorrect: true/false based on meaning accuracy
- feedback: Only provide if incorrect - direct explanation of the error (1-2 sentences, no praise)
- suggestions: Only provide if incorrect (max 3 alternative translations)`;

export const generateFeedback = async (params: GenerateFeedbackParams) => {
  const result = await generateObject({
    model: myProvider.languageModel('chat-model'),
    schema: generateFeedbackSchema,
    prompt: generateFeedbackPrompt(params),
  });

  return result.object;
};
