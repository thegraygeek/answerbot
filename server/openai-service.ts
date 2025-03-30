// This file is not used anymore. The OpenAI integration is now handled directly in routes.ts
// Keeping this file to avoid breaking any potential imports, but it's empty.

import { Message } from '../shared/schema';

/**
 * This function is deprecated and no longer used.
 * OpenAI integration is now handled directly in routes.ts
 */
export async function processMessage(messages: Message[]): Promise<Message> {
  console.warn('processMessage in openai-service.ts is deprecated. OpenAI integration is now in routes.ts');
  
  return {
    role: 'assistant',
    content: 'This service is deprecated. Please use the implementation in routes.ts'
  };
}