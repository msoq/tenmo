import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import { getTopics, createTopic } from '@/lib/db/queries';

export const maxDuration = 60;

const createTopicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  category: z.string().min(1, 'Category is required').max(50),
  difficulty: z.number().int().min(1).max(5),
});

const getTopicsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  category: z.string().max(50).optional(),
  activeOnly: z.coerce.boolean().default(true),
});

// GET - Retrieve topics with optional filtering
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const params = getTopicsSchema.parse(queryParams);

    const topics = await getTopics({
      ...params,
      createdByUserId: session.user.id,
    });

    return Response.json(topics);
  } catch (error) {
    console.error('Error retrieving topics:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    return Response.json(
      { error: 'Failed to retrieve topics' },
      { status: 500 },
    );
  }
}

// POST - Create new topic
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = createTopicSchema.parse(body);

    const topic = await createTopic({
      ...params,
      createdByUserId: session.user.id,
    });

    return Response.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }

    return Response.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
