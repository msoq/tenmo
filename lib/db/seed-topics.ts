import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { topics } from './schema';

config({
  path: ['.env', '.env.local'],
});

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!, { max: 1 });
const db = drizzle(client);

const exampleTopics = [
  // Grammar topics
  {
    title: 'Past Tense Practice',
    description:
      'Practice forming and using past tense verbs in everyday situations',
    level: 'A2' as const,
    category: 'grammar',
    fromLanguage: 'en',
    toLanguage: 'es',
    difficulty: 2,
    createdByUserId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Conditional Sentences',
    description:
      'Learn to express hypothetical situations and consequences with if-then statements',
    level: 'B1' as const,
    category: 'grammar',
    fromLanguage: 'en',
    toLanguage: 'es',
    difficulty: 3,
    createdByUserId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Present Perfect Usage',
    description:
      'Master the present perfect tense for actions connecting past and present',
    level: 'B2' as const,
    category: 'grammar',
    fromLanguage: 'en',
    toLanguage: 'es',
    difficulty: 4,
    createdByUserId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Vocabulary topics
  {
    title: 'Travel Essentials',
    description:
      'Common words and phrases needed for traveling and navigating new places',
    level: 'A1' as const,
    category: 'vocabulary',
    fromLanguage: 'en',
    toLanguage: 'es',
    difficulty: 1,
    createdByUserId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Business Terminology',
    description:
      'Professional vocabulary for workplace communication and business meetings',
    level: 'B2' as const,
    category: 'vocabulary',
    fromLanguage: 'en',
    toLanguage: 'es',
    difficulty: 4,
    createdByUserId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Food and Cooking',
    description:
      'Kitchen vocabulary, cooking methods, and restaurant conversation',
    level: 'A2' as const,
    category: 'vocabulary',
    fromLanguage: 'en',
    toLanguage: 'es',
    difficulty: 2,
    createdByUserId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedTopics() {
  try {
    console.log('🌱 Seeding topics...');

    const result = await db.insert(topics).values(exampleTopics).returning();

    console.log(`✅ Successfully seeded ${result.length} topics`);
    console.log('Topics created:');
    for (const topic of result) {
      console.log(`  - ${topic.title} (${topic.level}, ${topic.category})`);
    }
  } catch (error) {
    console.error('❌ Error seeding topics:', error);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  seedTopics();
}

export { seedTopics };
