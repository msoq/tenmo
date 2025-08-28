'use server';

import { revalidatePath } from 'next/cache';
import { createTopic, updateTopic } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';

const topicFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  difficulty: z
    .number()
    .int()
    .min(1, 'Difficulty must be at least 1')
    .max(5, 'Difficulty must be at most 5'),
});

export async function createTopicAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      level: formData.get('level'),
      category: formData.get('category'),
      difficulty: Number(formData.get('difficulty')),
    };

    const validatedData = topicFormSchema.parse(rawData);

    const newTopic = await createTopic({
      title: validatedData.title,
      description: validatedData.description,
      level: validatedData.level,
      category: validatedData.category,
      difficulty: validatedData.difficulty,
      createdByUserId: session.user.id,
    });

    revalidatePath('/topics');

    return {
      success: true,
      topicId: newTopic.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: 'Failed to create topic',
    };
  }
}

export async function updateTopicAction(id: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      level: formData.get('level'),
      category: formData.get('category'),
      difficulty: Number(formData.get('difficulty')),
    };

    const validatedData = topicFormSchema.parse(rawData);

    const updatedTopic = await updateTopic({
      id,
      title: validatedData.title,
      description: validatedData.description,
      level: validatedData.level,
      category: validatedData.category,
      difficulty: validatedData.difficulty,
    });

    if (!updatedTopic) {
      return {
        success: false,
        error: 'Topic not found',
      };
    }

    revalidatePath('/topics');
    revalidatePath(`/topics/${id}`);

    return {
      success: true,
      topicId: updatedTopic.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: 'Failed to update topic',
    };
  }
}
