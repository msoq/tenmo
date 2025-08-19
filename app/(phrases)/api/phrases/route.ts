import { auth } from '@/app/(auth)/auth';
import {
  generatePhrases,
  requestBodySchema,
} from '@/lib/ai/prompts/phrase/generate-phrases';
import { getTopicsByIds } from '@/lib/db/queries';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyJson = await request.json();
    const body = requestBodySchema.parse(bodyJson);
    const topics = await getTopicsByIds({ ids: body.topicIds });

    if (!topics || topics.length === 0) {
      return Response.json(
        {
          error: 'Invalid topicIds',
          details: ['No topics found for provided ids'],
        },
        { status: 400 },
      );
    }

    const phrases = await generatePhrases({
      from: body.from,
      to: body.to,
      topics: topics.map((t) => t.title),
      count: body.count,
      instruction: body.instruction,
      level: body.level,
      phraseLength: body.phraseLength,
    });

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
