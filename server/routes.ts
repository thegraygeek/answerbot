import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema, registrationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    firstName?: string;
    isLoggedIn?: boolean;
    messages?: Array<{
      role: string;
      content: string;
    }>;
  }
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "";

// Create OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Function to ensure session has messages initialized - returns a promise
const ensureSessionMessages = async (req: Request): Promise<Array<{ role: string, content: string }>> => {
  // Initialize the session if needed
  if (!req.session.messages || req.session.messages.length === 0) {
    // Create welcome message
    const welcomeMessage = {
      role: 'assistant',
      content: `Hello there! I'm the TTwW Answerbot. I provide concise tech answers in 50 words or less. What tech question can I help with today?`
    };
    
    // Initialize messages with welcome message
    req.session.messages = [welcomeMessage];
    
    // Save the session explicitly
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  return req.session.messages;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialization middleware to ensure all sessions have chat initialized
  app.use(async (req, res, next) => {
    // Skip API routes as they have their own session handling
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    if (req.session) {
      try {
        await ensureSessionMessages(req);
      } catch (error) {
        console.error("Failed to initialize session:", error);
      }
    }
    next();
  });

  // API route to provide authentication status compatibility
  app.get("/api/auth/status", (req, res) => {
    // Auto-initialize session and return a default authenticated state
    // This ensures compatibility with any remaining auth checks in the frontend
    return res.json({
      isLoggedIn: true,
      userId: 1,
      firstName: "User"
    });
  });

  // Get chat history - no authentication required
  app.get("/api/chat/history", async (req, res) => {
    if (req.session) {
      try {
        const messages = await ensureSessionMessages(req);
        return res.json({ messages });
      } catch (error) {
        console.error("Failed to save session:", error);
        return res.status(500).json({ message: "Session initialization failed" });
      }
    } else {
      return res.status(500).json({ message: "Session initialization failed" });
    }
  });
  
  // Clear chat history and start new chat - no authentication required
  app.post("/api/chat/clear", async (req, res) => {
    if (req.session) {
      try {
        // Create welcome message
        const welcomeMessage = {
          role: 'assistant',
          content: `Hello there! I'm the TTwW Answerbot. I provide concise tech answers in 50 words or less. What tech question can I help with today?`
        };
        
        // Reset messages to just the welcome message
        req.session.messages = [welcomeMessage];
        
        // Save the session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        return res.json({ 
          message: 'Chat history cleared',
          messages: [welcomeMessage]
        });
      } catch (error) {
        console.error("Failed to save session:", error);
        return res.status(500).json({ message: 'Failed to clear chat history' });
      }
    } else {
      return res.status(500).json({ message: 'Failed to clear chat history' });
    }
  });
  
  // API route for getting AI response - no authentication required
  app.post("/api/chat", async (req, res) => {
    try {
      console.log("Received chat API request:", req.body);
      const body = messageSchema.parse(req.body);
      
      if (!OPENAI_API_KEY) {
        console.log("Missing OpenAI API key");
        return res.status(500).json({ 
          message: "OpenAI API key is not configured. Please add it to your environment variables." 
        });
      }

      try {
        // Log session state before processing
        console.log("Session before processing:", req.session);
        
        // Initialize message history if not already present
        if (!req.session.messages) {
          console.log("No messages in session, initializing empty array");
          req.session.messages = [];
        }
        
        // Add user message to history
        console.log("Adding user message to history:", body.content);
        req.session.messages.push({
          role: 'user',
          content: body.content
        });
        
        // Prepare message history for OpenAI, including only the last 10 messages to keep context reasonable
        const messageHistory = req.session.messages.slice(-10);
        console.log("Message history (last 10):", JSON.stringify(messageHistory));
        
        // Create properly typed messages for the OpenAI API
        const systemMessage: ChatCompletionMessageParam = { 
          role: "system", 
          content: "You are TTwW Answerbot, a friendly assistant who helps adult learners with entry-level tech skills understand technology better. Follow these guidelines when responding:\n\n1. STRICT RULE: Limit all responses to a maximum of 50 words\n2. Use clear, straightforward language that respects the user's intelligence while avoiding jargon\n3. Write for adults who have basic tech familiarity (smartphones, email, web browsing) but want to improve\n4. Use helpful comparisons to everyday experiences adults would relate to\n5. Break complex ideas into simple parts without being patronizing\n6. Briefly explain technical terms when necessary\n7. Keep answers practical and relevant to everyday use cases\n8. Format responses with bullet points when appropriate\n9. Use examples that would resonate with adult learners\n10. Be encouraging and patient, acknowledging that technology learning is ongoing\n11. IMPORTANT: Count your words before responding and ensure you stay under 50 words" 
        };
        
        // Create an array of properly typed messages
        const chatMessages: ChatCompletionMessageParam[] = [systemMessage];
        
        // Add only valid message types (user and assistant)
        messageHistory.forEach(msg => {
          if (msg.role === 'user' || msg.role === 'assistant') {
            chatMessages.push({
              role: msg.role,
              content: msg.content
            });
          }
        });
        
        console.log("Calling OpenAI API with messages:", JSON.stringify(chatMessages));
        
        // Call OpenAI API with the new client
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 100  // Reduced to enforce 50-word limit (approx 100 tokens)
        });

        console.log("OpenAI API response:", JSON.stringify(completion.choices));
        
        const aiResponse = completion.choices[0].message.content?.trim() || "Sorry, I couldn't generate a response.";
        console.log("Final AI response:", aiResponse);
        
        // Create assistant message
        const assistantMessage = {
          role: 'assistant',
          content: aiResponse
        };
        
        // Add assistant message to history
        req.session.messages.push(assistantMessage);
        
        // Limit session history to prevent it from growing too large
        if (req.session.messages.length > 20) {
          req.session.messages = req.session.messages.slice(-20);
        }

        // Save the session explicitly
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        return res.json(assistantMessage);
      } catch (error) {
        const openaiError = error as Error;
        console.error("OpenAI API error:", openaiError);
        return res.status(500).json({ 
          message: "Error from OpenAI API", 
          details: openaiError.message || "Unknown error occurred"
        });
      }
    } catch (error) {
      console.error("Chat API error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", details: error.format() });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
