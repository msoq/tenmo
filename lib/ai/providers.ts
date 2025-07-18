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
      'chat-model': google('gemini-2.5-pro'),
      'chat-model-reasoning': wrapLanguageModel({
        model: google('gemini-2.5-pro'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': google('gemini-2.5-pro'),
      'artifact-model': google('gemini-2.5-pro'),
    },
  }),
  anthropic: customProvider({
    languageModels: {
      'chat-model': anthropic('claude-3-5-sonnet-20241022'),
      'chat-model-reasoning': wrapLanguageModel({
        model: anthropic('claude-3-5-sonnet-20241022'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': anthropic('claude-3-5-haiku-20241022'),
      'artifact-model': anthropic('claude-3-5-sonnet-20241022'),
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
