import { generateObject } from 'ai';
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/providers';
import { phrasePrompt, phraseSchema } from '@/lib/ai/prompts/phrase';
import { z } from 'zod';

export const maxDuration = 60;

const requestBodySchema = z.object({
  from: z
    .string()
    .min(1, 'Source language is required')
    .max(50, 'Source language must be 50 characters or less'),
  to: z
    .string()
    .min(1, 'Target language is required')
    .max(50, 'Target language must be 50 characters or less'),
  topic: z
    .string()
    .min(1, 'Topic is required')
    .max(100, 'Topic must be 100 characters or less'),
  count: z.coerce.number().int().min(1).max(50).default(10),
  instruction: z
    .string()
    .max(500, 'Instruction must be 500 characters or less')
    .default('None'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
  phraseLength: z.coerce.number().int().min(1).max(20).default(5),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = requestBodySchema.parse(body);

    const result = await generateObject({
      model: myProvider.languageModel('chat-model'),
      schema: phraseSchema,
      prompt: phrasePrompt(params),
    });

    return Response.json({ phrases: result.object.phrases });
  } catch (error) {
    console.error('Error generating phrases:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }

    return Response.json(
      { error: 'Failed to generate phrases' },
      { status: 500 },
    );
  }
}
