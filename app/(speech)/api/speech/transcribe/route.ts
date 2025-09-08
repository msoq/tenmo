import { auth } from '@/app/(auth)/auth';
import { experimental_transcribe as transcribe } from 'ai';
import { aiProvider } from '@/lib/ai/providers';

export const maxDuration = 60; // seconds

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const form = await request.formData();
    const file = form.get('file');

    // Validate file
    if (!(file instanceof File)) {
      return Response.json(
        { error: 'No audio file provided' },
        { status: 400 },
      );
    }

    // Check file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return Response.json(
        { error: 'File too large (max 25MB)' },
        { status: 400 },
      );
    }

    // Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const audio = new Uint8Array(arrayBuffer);

    // Transcribe with Whisper
    const result = await transcribe({
      model: aiProvider.speech.transcriptionModel('whisper-1'),
      audio,
    });

    return Response.json(
      {
        text: result.text,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Transcription error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return Response.json(
          { error: 'Transcription service not configured' },
          { status: 503 },
        );
      }
    }

    return Response.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 },
    );
  }
}
