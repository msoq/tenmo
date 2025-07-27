import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import { 
  getTopicById, 
  updateTopic, 
  deleteTopic,
} from '@/lib/db/queries';

export const maxDuration = 60;

const updateTopicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().min(1, 'Description is required').max(1000).optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  category: z.string().min(1, 'Category is required').max(50).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
});

const deleteTopicSchema = z.object({
  softDelete: z.coerce.boolean().default(true),
});

// GET - Retrieve single topic by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return Response.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const topic = await getTopicById({ id });
    
    if (!topic) {
      return Response.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return Response.json(topic);
  } catch (error) {
    console.error('Error retrieving topic:', error);
    
    return Response.json(
      { error: 'Failed to retrieve topic' },
      { status: 500 }
    );
  }
}

// PUT - Update existing topic
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return Response.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Check if topic exists and user has permission to update
    const existingTopic = await getTopicById({ id });
    
    if (!existingTopic) {
      return Response.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Only allow the creator to update their own topics, or allow all users for system topics
    if (existingTopic.createdByUserId && existingTopic.createdByUserId !== session.user.id) {
      return Response.json(
        { error: 'Forbidden: You can only update your own topics' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData = updateTopicSchema.parse(body);

    const updatedTopic = await updateTopic({
      id,
      ...updateData,
    });

    if (!updatedTopic) {
      return Response.json(
        { error: 'Failed to update topic' },
        { status: 500 }
      );
    }

    return Response.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE - Delete topic (soft delete by default)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return Response.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Check if topic exists and user has permission to delete
    const existingTopic = await getTopicById({ id });
    
    if (!existingTopic) {
      return Response.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Only allow the creator to delete their own topics, or allow all users for system topics
    if (existingTopic.createdByUserId && existingTopic.createdByUserId !== session.user.id) {
      return Response.json(
        { error: 'Forbidden: You can only delete your own topics' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { softDelete } = deleteTopicSchema.parse(queryParams);

    const deletedTopic = await deleteTopic({ 
      id, 
      softDelete,
    });

    if (!deletedTopic) {
      return Response.json(
        { error: 'Failed to delete topic' },
        { status: 500 }
      );
    }

    return Response.json({ 
      message: softDelete ? 'Topic deactivated successfully' : 'Topic deleted successfully',
      topic: deletedTopic,
    });
  } catch (error) {
    console.error('Error deleting topic:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}