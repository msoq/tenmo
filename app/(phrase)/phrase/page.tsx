import { generateObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { Phrase } from '@/components/phrase';
import { z } from 'zod';
import { phrasePrompt, phraseSchema } from '@/lib/ai/prompts/phrase';

const searchParamsSchema = z.object({
  from: z
    .string()
    .min(1, 'Source language is required')
    .max(50, 'Source language must be 50 characters or less'),
  to: z
    .string()
    .min(1, 'Target language is required')
    .max(50, 'Target language must be 50 characters or less'),
  topic: z
    .string()
    .min(1, 'Topic is required')
    .max(100, 'Topic must be 100 characters or less'),
  count: z.coerce.number().int().min(1).max(50).default(10),
  instruction: z
    .string()
    .max(500, 'Instruction must be 500 characters or less')
    .default('None'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('C1'),
  phraseLength: z.coerce.number().int().min(1).max(20).default(5),
});

type PhraseParams = z.infer<typeof searchParamsSchema>;

async function generatePhrases(params: PhraseParams) {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/guest');
  }

  try {
    const result = await generateObject({
      model: myProvider.languageModel('chat-model'),
      schema: phraseSchema,
      prompt: phrasePrompt(params),
    });

    return result.object.phrases;
  } catch (error) {
    console.error('Error generating phrases:', error);
    return [];
  }
}

export default async function Page({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = searchParamsSchema.parse(await searchParams);
  const phrases = await generatePhrases(params);

  return <Phrase phrases={phrases} />;
}
