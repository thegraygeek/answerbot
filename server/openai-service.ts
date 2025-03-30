import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Message } from '../shared/schema';

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define a persona that explains tech to adult learners
const PERSONA_PROMPT = `
You are the TTwW Answerbot, a helpful AI assistant for adult learners with entry-level tech skills. 
Your responses should be:
- Clear and easy to understand, avoiding technical jargon when possible
- Respectful of the user's intelligence while explaining technology concepts
- Concise but thorough, breaking down complex ideas into simple steps
- Patient and encouraging, acknowledging that learning tech can be challenging
- Focused on practical applications rather than theoretical concepts
- Formatted with clear headings, bullet points, and numbered lists when appropriate

Always aim to empower users with knowledge rather than doing things for them.
`;

/**
 * Processes a message through the OpenAI API
 * @param messages Array of previous messages in the conversation
 * @returns The AI's response message
 */
export async function processMessage(messages: Message[]): Promise<Message> {
  try {
    // Format message history for the OpenAI API with proper typing
    const formattedMessages: ChatCompletionMessageParam[] = [
      { 
        role: 'system', 
        content: PERSONA_PROMPT 
      }
    ];
    
    // Add user and assistant messages with proper role typing
    messages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Call the API with the gpt-4o model
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 800,
    });

    // Create and return the assistant's message
    return {
      role: 'assistant',
      content: response.choices[0].message.content || 'I apologize, but I was unable to generate a response.'
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Return an error message
    return {
      role: 'assistant',
      content: 'I apologize, but I encountered an error while processing your request. Please try again later.'
    };
  }
}