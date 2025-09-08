import { generateObject } from 'ai';
import { z } from 'zod';
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
  from: z.string().min(2).max(10),
  to: z.string().min(2).max(10),
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
  return `You are an expert in ${params.to} giving feedback on translations.

### Student
- Level: ${params.level}
- From: ${params.from} → To: ${params.to}

### Topic
- Title: ${params.topic.title}
- Description: ${params.topic.description}
- Category: ${params.topic.category}
- Difficulty: ${params.topic.difficulty}/10

### Exercise
- Original (${params.from}): "${params.phraseText}"
- Student (${params.to}): "${params.userTranslation}"

### Task
Check the translation for accuracy.
- Be forgiving: minor typos, small spelling mistakes, and natural synonyms are allowed.
- Feedback must be in ${params.from}, short, friendly, and focused only on useful corrections.
- Do not include greetings, praise, filler, or unrelated comments.
- Clearly point out errors and provide the correct form.

### Rules
- Correct or minor issues (typos, spelling, synonyms) → "isCorrect: true".
- Feedback (only when "isCorrect: true" AND there are typos/minor corrections): short note on minor issues.
- If the translation is perfectly correct with no typos or minor corrections, DO NOT include feedback.
- Meaning or grammar mistakes → "isCorrect: false".
- Feedback: concise explanation (1-2 sentences).
- Suggestions: up to 3 alternative translations.

### Criteria
- Meaning/grammar = correctness.
- Minor typos, small spelling errors, or acceptable synonyms = still correct.
- Must fit topic context and CEFR ${params.level}.

### Feedback Style
- Direct, friendly, neutral.
- Avoid formal or official tone.
- Use plain corrections in ${params.from}.

### Output
- isCorrect: true/false
- feedback: in ${params.from}; ONLY include if there are typos/minor corrections when isCorrect=true, or an explanation when isCorrect=false. If perfectly correct, omit.
- suggestions: up to 3 alternatives if incorrect`;
};

export const generateFeedback = async (params: GenerateFeedbackParams) => {
  const result = await generateObject({
    model: aiProvider.text.languageModel('chat-model'),
    schema: generateFeedbackSchema,
    prompt: generateFeedbackPrompt(params),
  });

  return result.object;
};
