import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

const xaiProvider = customProvider({
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
});

const googleProvider = customProvider({
  languageModels: {
    'chat-model': google('gemini-2.5-pro'),
    'chat-model-reasoning': wrapLanguageModel({
      model: google('gemini-2.5-pro'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': google('gemini-2.5-pro'),
    'artifact-model': google('gemini-2.5-pro'),
  },
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : googleProvider;
