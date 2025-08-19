import { auth } from '@/app/(auth)/auth';
import {
  createUserPhrasesSettings,
  getTopicsByIds,
  getUserPhrasesSettings,
  updateUserPhrasesSettings,
} from '@/lib/db/queries';
import { z } from 'zod';

export const maxDuration = 60;

const phraseSettingsSchema = z.object({
  from: z.string().min(2, 'Source language code is required').max(10),
  to: z.string().min(2, 'Target language code is required').max(10),
  topics: z
    .array(z.string().uuid())
    .min(1, 'At least one topic is required')
    .max(5, 'Maximum 5 topics allowed'),
  count: z.number().int().min(10).max(50),
  instruction: z.string().max(500).optional().default(''),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  phraseLength: z.number().int().min(5).max(20),
});

// GET - Retrieve user's phrase settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getUserPhrasesSettings(session.user.id);

    if (!settings) {
      return Response.json(null);
    }

    // Transform database model to API response
    const response = {
      from: settings.fromLanguage,
      to: settings.toLanguage,
      topics: settings.topicIds,
      count: settings.count,
      instruction: settings.instruction || '',
      level: settings.level,
      phraseLength: settings.phraseLength,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error retrieving phrase settings:', error);
    return Response.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 },
    );
  }
}

// POST - Create initial user settings (first-time setup)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = phraseSettingsSchema.parse(body);

    // Validate topic IDs exist to avoid FK errors
    const uniqueTopicIds = Array.from(new Set(params.topics));
    const foundTopics = await getTopicsByIds({ ids: uniqueTopicIds });
    if (foundTopics.length !== uniqueTopicIds.length) {
      const foundIds = new Set(foundTopics.map((t) => t.id));
      const missing = uniqueTopicIds.filter((id) => !foundIds.has(id));
      return Response.json(
        { error: 'Invalid topic IDs', details: missing },
        { status: 400 },
      );
    }

    // Check if settings already exist
    const existingSettings = await getUserPhrasesSettings(session.user.id);
    if (existingSettings) {
      return Response.json(
        { error: 'Settings already exist. Use PUT to update.' },
        { status: 409 },
      );
    }

    const settings = await createUserPhrasesSettings(session.user.id, params);

    // Transform database model to API response (read back topicIds)
    const reread = await getUserPhrasesSettings(session.user.id);
    const response = {
      from: settings.fromLanguage,
      to: settings.toLanguage,
      topics: reread?.topicIds ?? [],
      count: settings.count,
      instruction: settings.instruction || '',
      level: settings.level,
      phraseLength: settings.phraseLength,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error creating phrase settings:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }

    return Response.json(
      { error: 'Failed to create settings' },
      { status: 500 },
    );
  }
}

// PUT - Update existing user settings
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = phraseSettingsSchema.parse(body);

    // Validate topic IDs exist to avoid FK errors
    const uniqueTopicIds = Array.from(new Set(params.topics));
    const foundTopics = await getTopicsByIds({ ids: uniqueTopicIds });
    if (foundTopics.length !== uniqueTopicIds.length) {
      const foundIds = new Set(foundTopics.map((t) => t.id));
      const missing = uniqueTopicIds.filter((id) => !foundIds.has(id));
      return Response.json(
        { error: 'Invalid topic IDs', details: missing },
        { status: 400 },
      );
    }

    // Check if settings exist
    const existingSettings = await getUserPhrasesSettings(session.user.id);
    if (!existingSettings) {
      return Response.json(
        { error: 'Settings not found. Use POST to create.' },
        { status: 404 },
      );
    }

    const settings = await updateUserPhrasesSettings(session.user.id, params);

    // Transform database model to API response (read back topicIds)
    const reread = await getUserPhrasesSettings(session.user.id);
    const response = {
      from: settings.fromLanguage,
      to: settings.toLanguage,
      topics: reread?.topicIds ?? [],
      count: settings.count,
      instruction: settings.instruction || '',
      level: settings.level,
      phraseLength: settings.phraseLength,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error updating phrase settings:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }

    return Response.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    );
  }
}
