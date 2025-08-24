import { auth } from '@/app/(auth)/auth';
import {
  generatePhrases,
  requestBodySchema,
} from '@/lib/ai/prompts/phrase/generate-phrases';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = requestBodySchema.parse(body);
    const generatedPhrases = await generatePhrases(params);

    return new Response(JSON.stringify({ phrases: generatedPhrases }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      status: 200,
    });
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
