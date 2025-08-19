import type { Topic } from '@/lib/db/schema';
import { generateObject } from 'ai';
import z from 'zod';
import { myProvider } from '../../providers';

export const requestBodySchema = z.object({
  from: z.string().min(1).max(50),
  to: z.string().min(1).max(50),
  topics: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().default(''),
      }),
    )
    .min(1, 'At least one topic is required')
    .max(5, 'Maximum 5 topics allowed'),
  count: z.coerce.number().int().min(1).max(50).default(10),
  instruction: z.string().max(500).default('None'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
  phraseLength: z.coerce.number().int().min(1).max(20).default(5),
});

const phraseSchema = z.object({
  phrases: z.array(z.string()),
});

type GeneratePhrasePromptParams = z.infer<typeof requestBodySchema>;

const cefrDescriptions = {
  A1: 'Beginner - basic phrases, present tense, simple vocabulary, everyday expressions',
  A2: 'Elementary - simple past/future, common topics, basic connectors, familiar situations',
  B1: 'Intermediate - various tenses, opinions, hypothetical situations, complex sentences',
  B2: 'Upper-intermediate - complex grammar, abstract topics, nuanced expression, detailed descriptions',
  C1: 'Advanced - sophisticated structures, idiomatic expressions, formal/informal registers, subtle meanings',
  C2: 'Proficient - near-native complexity, subtle distinctions, advanced discourse, specialized terminology',
} as const;

const formatTopics = (topics: Pick<Topic, 'title' | 'description'>[]) => {
  return topics
    .map((topic) =>
      topic.description ? `${topic.title} (${topic.description})` : topic.title,
    )
    .join(', ');
};

const generatePhrasesPrompt = ({
  from,
  to,
  topics,
  count,
  instruction,
  level,
  phraseLength,
}: GeneratePhrasePromptParams): string => {
  const minWords = Math.max(1, Math.round(phraseLength * 0.8));
  const maxWords = Math.round(phraseLength * 1.2);
  const levelDescription = cefrDescriptions[level];
  const topicsText = formatTopics(topics);

  return `# Language Learning Phrase Generator

You are an **expert ${to} language teacher** with extensive experience in language pedagogy and curriculum development. Your specialization is creating contextually appropriate practice materials for students transitioning from ${from} to ${to}.

## Your Task
Generate a curated list of **${count} phrases in ${from}** specifically designed for **${level} level** ${to} language learners to practice **${topicsText}**.

## Language Proficiency Level: ${level}
**Target Level**: ${levelDescription}

## Educational Guidelines
- **CEFR Level Alignment**: All phrases must be appropriate for ${level} proficiency level
- **Contextual Relevance**: Ensure all phrases are directly related to the topic(s): "${topicsText}"
- **Practical Usage**: Focus on phrases students will actually use in real conversations
- **Cultural Appropriateness**: Consider cultural context and common usage patterns
- **Pedagogical Value**: Each phrase should teach something meaningful about ${to} language structure at ${level} level

## Content Requirements
- **Topic Focus**: All phrases must be relevant to the selected topic(s): "${topicsText}"
- **Natural Language**: Use authentic, conversational ${from} that feels natural to native speakers
- **Level-Appropriate Complexity**: Match the grammatical and lexical complexity to ${level} level
- **Useful Vocabulary**: Incorporate essential vocabulary for the topic areas appropriate for ${level}
- **Grammar Patterns**: Include sentence structures appropriate for ${level} learners
- **Balanced Coverage**: Randomly distribute phrases across all topics: ${topicsText}

## Additional Instructions
${instruction !== 'None' ? `**Special Requirements**: ${instruction}` : `**Focus**: Conversational phrases appropriate for ${level} level learners`}

## Quality Standards
- **Phrase Length**: Each phrase should be approximately **${minWords}-${maxWords} words** (target: ${phraseLength} words ±20%)
- **CEFR Compliance**: Ensure all phrases match ${level} proficiency level requirements
- **Common Usage**: Phrases should be commonly used in real-world contexts
- **Sentence Variety**: Include a variety of sentence types (statements, questions, expressions)
- **Topic Coherence**: Maintain strong relevance to "${topicsText}" throughout all phrases

Generate the phrases now:
`;
};

export const generatePhrases = async (params: GeneratePhrasePromptParams) => {
  const result = await generateObject({
    model: myProvider.languageModel('chat-model'),
    schema: phraseSchema,
    prompt: generatePhrasesPrompt(params),
  });

  return result.object.phrases;
};
