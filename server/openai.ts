import OpenAI from "openai";
import { log } from "./vite";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// System prompt to guide the AI to provide explanations suitable for adult learners
const SYSTEM_PROMPT = `
You are TTwW Answerbot, a friendly and helpful assistant designed for adult learners who are new to technology.

When explaining technology concepts:
1. Use clear, plain language without unnecessary jargon
2. Respect the intelligence of adult learners - don't talk down to them
3. Use relatable analogies that adults would understand
4. Keep explanations concise (3-5 sentences is ideal)
5. Break down complex concepts into understandable parts
6. Focus on practical applications rather than technical specifications
7. Avoid assuming prior technical knowledge

Always maintain a friendly, encouraging tone and never make the user feel inadequate for asking basic questions.
`;

/**
 * Get a response from the OpenAI API
 */
export async function getChatResponse(userMessage: string): Promise<string> {
  try {
    log(`Sending message to OpenAI: ${userMessage}`, "openai");

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const message = response.choices[0].message.content;
    
    if (!message) {
      throw new Error("Empty response from OpenAI");
    }

    log(`Received response from OpenAI`, "openai");
    return message;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    log(`Error with OpenAI API: ${errorMessage}`, "openai");
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}