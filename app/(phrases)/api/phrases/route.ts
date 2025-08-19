import { auth } from '@/app/(auth)/auth';
import { generatePhrases } from '@/lib/ai/prompts/phrase/generate-phrases';
import { getTopicsByIds, getUserPhrasesSettings } from '@/lib/db/queries';
import { z } from 'zod';

export const maxDuration = 60;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getUserPhrasesSettings(session.user.id);
    if (!settings) {
      return Response.json(
        { error: 'No phrase settings found for user' },
        { status: 400 },
      );
    }

    // Extract and validate topic IDs from settings
    const topicIds = (settings.topic || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const topics = await getTopicsByIds({ ids: topicIds });
    if (!topics || topics.length === 0) {
      return Response.json(
        {
          error: 'Invalid settings',
          details: ['No topics found for topicIds'],
        },
        { status: 400 },
      );
    }

    const phrases = await generatePhrases({
      from: settings.fromLanguage,
      to: settings.toLanguage,
      topics: topics.map((t) => t.title),
      count: settings.count,
      instruction: settings.instruction || 'None',
      level: settings.level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      phraseLength: settings.phraseLength,
    });

    return new Response(JSON.stringify({ phrases }), {
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
