import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import {
  generateFeedbackBodySchema,
  generateFeedback,
} from '@/lib/ai/prompts/phrase/generate-feedback';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = generateFeedbackBodySchema.parse(body);

    const feedback = await generateFeedback(params);

    return Response.json({
      ...feedback,
      id: params.id,
    });
  } catch (error) {
    console.error('Error generating translation feedback:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }

    return Response.json(
      { error: 'Failed to generate feedback' },
      { status: 500 },
    );
  }
}
