import { auth } from '@/app/(auth)/auth';
import { getUserPreferences, setActiveLanguagePair } from '@/lib/db/queries';
import { z } from 'zod';

export const maxDuration = 30;

const bodySchema = z.object({
  from: z.string().min(2).max(10),
  to: z.string().min(2).max(10),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prefs = await getUserPreferences(session.user.id);
    if (!prefs) return Response.json(null);

    return Response.json({
      from: prefs.activeFromLanguage,
      to: prefs.activeToLanguage,
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get preferences' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const params = bodySchema.parse(body);

    const saved = await setActiveLanguagePair({
      userId: session.user.id,
      from: params.from,
      to: params.to,
    });

    return Response.json({
      from: saved.activeFromLanguage,
      to: saved.activeToLanguage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 },
      );
    }
    return Response.json(
      { error: 'Failed to update preferences' },
      { status: 500 },
    );
  }
}
