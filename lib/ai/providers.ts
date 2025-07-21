import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const providers = {
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
      'chat-model': anthropic('claude-3-5-haiku-latest'),
      'chat-model-reasoning': wrapLanguageModel({
        model: anthropic('claude-3-5-haiku-latest'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': anthropic('claude-3-5-haiku-latest'),
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

export const myProvider = isTestEnvironment ? providers.test : providers.google;
