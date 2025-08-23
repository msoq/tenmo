import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openrouter } from '@openrouter/ai-sdk-provider';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

const { PROVIDER_NAME } = process.env;

const providers = {
  openai: customProvider({
    transcriptionModels: {
      'whisper-1': openai.transcription('whisper-1'),
    },
  }),
  xai: customProvider({
    languageModels: {
      'chat-model': xai('grok-2-vision-1212'),
      'chat-model-reasoning': wrapLanguageModel({
        model: xai('grok-3-mini-beta'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': xai('grok-2-1212'),
      'artifact-model': xai('grok-2-1212'),
    },
    imageModels: {
      'small-model': xai.imageModel('grok-2-image'),
    },
  }),
  google: customProvider({
    languageModels: {
      'chat-model': google('gemini-2.5-flash'),
      'chat-model-reasoning': wrapLanguageModel({
        model: google('gemini-2.5-flash'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': google('gemini-2.5-flash'),
    },
  }),
  anthropic: customProvider({
    languageModels: {
      'chat-model': anthropic('claude-3-5-haiku-20241022'),
      'chat-model-reasoning': wrapLanguageModel({
        model: anthropic('claude-3-5-haiku-latest'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': anthropic('claude-3-5-haiku-latest'),
    },
  }),
  // Not available yet
  openrouter: customProvider({
    languageModels: {
      'chat-model': openrouter('google/gemini-2.0-flash-001'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openrouter('google/gemini-2.0-flash-001'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openrouter('google/gemini-2.0-flash-001'),
    },
  }),
  test: customProvider({
    languageModels: {
      'chat-model': chatModel,
      'chat-model-reasoning': reasoningModel,
      'title-model': titleModel,
      'artifact-model': artifactModel,
    },
  }),
};

function isProviderName(name: unknown): name is keyof typeof providers {
  return typeof name === 'string' && name in providers;
}

if (!isProviderName(PROVIDER_NAME)) {
  throw new Error(`Unknown provider: ${PROVIDER_NAME}`);
}

export const aiProvider = {
  text: providers[PROVIDER_NAME],
  speech: providers.openai,
};
