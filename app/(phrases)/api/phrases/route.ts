import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import {
  generatePhrases,
  requestBodySchema,
} from '@/lib/ai/prompts/phrase/generate-phrases';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = requestBodySchema.parse(body);

    const phrases = await generatePhrases(params);

    return Response.json({ phrases });
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
