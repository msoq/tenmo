import { auth } from '@/app/(auth)/auth';
import { generatePhrases } from '@/lib/ai/prompts/phrase/generate-phrases';
import { getTopicsByIds, getUserPhrasesSettings } from '@/lib/db/queries';
import { normalizeLanguageToName } from '@/lib/utils/language-utils';
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

    const topics = await getTopicsByIds({ ids: settings.topicIds });
    if (!topics || topics.length === 0) {
      return Response.json(
        {
          error: 'Invalid settings',
          details: ['No topics found for topicIds'],
        },
        { status: 400 },
      );
    }

    // Pass full topic objects with IDs to the generation function
    const topicsWithIds = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description || '',
    }));

    const generatedPhrases = await generatePhrases({
      from: normalizeLanguageToName(settings.fromLanguage),
      to: normalizeLanguageToName(settings.toLanguage),
      topics: topicsWithIds,
      count: settings.count,
      instruction: settings.instruction || 'None',
      level: settings.level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      phraseLength: settings.phraseLength,
    });

    // The phrases now already include topicId from the AI generation
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
