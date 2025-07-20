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
    .describe('Detailed pedagogical feedback on the translation'),
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
Evaluate the student's translation and provide constructive feedback appropriate for their CEFR level.

**Guidelines:**
1. **Accuracy Assessment**: Compare the meaning, context, and cultural appropriateness
2. **CEFR-Appropriate Feedback**: Adjust complexity based on ${params.level} level
3. **Pedagogical Approach**: Be encouraging while being accurate
4. **Language-Specific**: Consider grammar rules and cultural context of both languages

**Feedback Criteria:**
- For A1/A2: Focus on basic meaning and simple corrections
- For B1/B2: Include grammar explanations and context
- For C1/C2: Provide nuanced feedback on style and cultural appropriateness

**Response Format:**
- feedback: Constructive explanation (2-3 sentences)
- isCorrect: true/false based on meaning accuracy
- suggestions: Alternative translations if incorrect (max 3)`;

export const generateFeedback = async (params: GenerateFeedbackParams) => {
  const result = await generateObject({
    model: myProvider.languageModel('chat-model'),
    schema: generateFeedbackSchema,
    prompt: generateFeedbackPrompt(params),
  });

  return result.object;
};
