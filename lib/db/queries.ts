import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import type { ArtifactKind } from '@/components/artifact';
import type { PhraseSettings } from '@/components/phrase-settings-dialog';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';
import { generateUUID } from '../utils';
import {
  chat,
  type Chat,
  type DBMessage,
  document,
  message,
  stream,
  type Suggestion,
  suggestion,
  type Topic,
  topics,
  user,
  type User,
  type UserPhrasesSettings,
  userPhrasesSettings,
  userPhrasesSettingsTopic,
  type UserPhrasesSettingsWithTopics,
  vote,
} from './schema';
import { generateHashedPassword } from './utils';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

export async function getUserPhrasesSettings(
  userId: string,
): Promise<UserPhrasesSettingsWithTopics | null> {
  try {
    const settings = await db
      .select()
      .from(userPhrasesSettings)
      .where(eq(userPhrasesSettings.userId, userId))
      .limit(1);

    const base = settings[0] || null;
    if (!base) return null;

    const rows = await db
      .select({ topicId: userPhrasesSettingsTopic.topicId })
      .from(userPhrasesSettingsTopic)
      .where(eq(userPhrasesSettingsTopic.settingsId, base.id));

    return {
      ...base,
      topicIds: rows.map((r) => r.topicId),
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user phrases settings',
    );
  }
}

export async function createUserPhrasesSettings(
  userId: string,
  params: PhraseSettings,
): Promise<UserPhrasesSettings> {
  try {
    const settings = await db
      .insert(userPhrasesSettings)
      .values({
        userId,
        fromLanguage: params.from,
        toLanguage: params.to,
        count: params.count,
        instruction: params.instruction || null,
        level: params.level,
        phraseLength: params.phraseLength,
      })
      .returning();

    const created = settings[0];

    if (params.topicIds && params.topicIds.length > 0) {
      await db.insert(userPhrasesSettingsTopic).values(
        params.topicIds.map((topicId) => ({
          settingsId: created.id,
          topicId,
        })),
      );
    }

    return created;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create user phrases settings',
    );
  }
}

export async function updateUserPhrasesSettings(
  userId: string,
  params: PhraseSettings,
): Promise<UserPhrasesSettings> {
  try {
    return await db.transaction(async (tx) => {
      const settings = await tx
        .update(userPhrasesSettings)
        .set({
          fromLanguage: params.from,
          toLanguage: params.to,
          count: params.count,
          instruction: params.instruction || null,
          level: params.level,
          phraseLength: params.phraseLength,
          updatedAt: new Date(),
        })
        .where(eq(userPhrasesSettings.userId, userId))
        .returning();

      const updated = settings[0];

      // Replace join-table rows with new set (dedupe topic IDs)
      await tx
        .delete(userPhrasesSettingsTopic)
        .where(eq(userPhrasesSettingsTopic.settingsId, updated.id));

      const uniqueTopicIds = Array.from(new Set(params.topicIds || []));
      if (uniqueTopicIds.length > 0) {
        await tx.insert(userPhrasesSettingsTopic).values(
          uniqueTopicIds.map((topicId) => ({
            settingsId: updated.id,
            topicId,
          })),
        );
      }

      return updated;
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update user phrases settings',
    );
  }
}

export async function getTopics({
  limit = 20,
  level,
  category,
  createdByUserId,
  activeOnly = true,
  fromLanguage,
  toLanguage,
}: {
  limit?: number;
  level?: string;
  category?: string;
  createdByUserId?: string;
  activeOnly?: boolean;
  fromLanguage?: string;
  toLanguage?: string;
} = {}): Promise<Topic[]> {
  try {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(topics.isActive, true));
    }

    if (level) {
      conditions.push(
        eq(topics.level, level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'),
      );
    }

    if (category) {
      conditions.push(eq(topics.category, category));
    }

    if (createdByUserId) {
      conditions.push(eq(topics.createdByUserId, createdByUserId));
    }

    if (fromLanguage) {
      conditions.push(eq(topics.fromLanguage, fromLanguage));
    }

    if (toLanguage) {
      conditions.push(eq(topics.toLanguage, toLanguage));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(topics)
      .where(whereCondition)
      .orderBy(desc(topics.createdAt))
      .limit(limit);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get topics');
  }
}

export async function getTopicsByIds({
  ids,
}: { ids: string[] }): Promise<Topic[]> {
  try {
    if (!ids || ids.length === 0) return [];

    return await db.select().from(topics).where(inArray(topics.id, ids));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get topics by ids',
    );
  }
}

export async function getTopicById({
  id,
}: { id: string }): Promise<Topic | null> {
  try {
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, id))
      .limit(1);

    return topic || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get topic by id');
  }
}

export async function createTopic({
  title,
  description,
  level,
  category,
  difficulty,
  createdByUserId,
  fromLanguage,
  toLanguage,
}: {
  title: string;
  description: string;
  level: string;
  category: string;
  difficulty: number;
  createdByUserId?: string;
  fromLanguage: string;
  toLanguage: string;
}): Promise<Topic> {
  try {
    const [topic] = await db
      .insert(topics)
      .values({
        title,
        description,
        level: level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
        category,
        difficulty,
        createdByUserId: createdByUserId || null,
        fromLanguage,
        toLanguage,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return topic;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create topic');
  }
}

export async function updateTopic({
  id,
  title,
  description,
  level,
  category,
  difficulty,
  fromLanguage,
  toLanguage,
}: {
  id: string;
  title?: string;
  description?: string;
  level?: string;
  category?: string;
  difficulty?: number;
  fromLanguage?: string;
  toLanguage?: string;
}): Promise<Topic | null> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (level !== undefined)
      updateData.level = level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (fromLanguage !== undefined) updateData.fromLanguage = fromLanguage;
    if (toLanguage !== undefined) updateData.toLanguage = toLanguage;

    const [topic] = await db
      .update(topics)
      .set(updateData)
      .where(eq(topics.id, id))
      .returning();

    return topic || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update topic');
  }
}

export async function deleteTopic({
  id,
  softDelete = true,
}: {
  id: string;
  softDelete?: boolean;
}): Promise<Topic | null> {
  try {
    if (softDelete) {
      const [topic] = await db
        .update(topics)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(topics.id, id))
        .returning();

      return topic || null;
    } else {
      const [topic] = await db
        .delete(topics)
        .where(eq(topics.id, id))
        .returning();

      return topic || null;
    }
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to delete topic');
  }
}
