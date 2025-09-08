import { auth } from '@/app/(auth)/auth';
import {
  generateFeedback,
  generateFeedbackBodySchema,
  type GenerateFeedbackParams,
} from '@/lib/ai/prompts/phrase/generate-feedback';
import { getTopicById, getUserPhrasesSettings } from '@/lib/db/queries';
import { normalizeLanguageToName } from '@/lib/utils/language-utils';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedBody = generateFeedbackBodySchema.parse(body);

    // Fetch topic by ID
    const topic = await getTopicById({ id: validatedBody.topicId });

    if (!topic) {
      return Response.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Languages are provided by the client; only fetch level from settings
    const userSettings = await getUserPhrasesSettings(session.user.id);

    const effectiveFrom = validatedBody.from;
    const effectiveTo = validatedBody.to;
    const effectiveLevel = userSettings?.level || 'A1';

    // Prepare params for AI feedback generation
    const feedbackParams: GenerateFeedbackParams = {
      phraseText: validatedBody.phraseText,
      userTranslation: validatedBody.userTranslation,
      from: normalizeLanguageToName(effectiveFrom),
      to: normalizeLanguageToName(effectiveTo),
      level: effectiveLevel,
      topic: {
        title: topic.title,
        description: topic.description,
        category: topic.category,
        difficulty: topic.difficulty,
      },
    };

    // Generate AI feedback
    const feedback = await generateFeedback(feedbackParams);

    return Response.json({
      ...feedback,
      topicId: validatedBody.topicId,
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
