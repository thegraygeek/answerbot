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

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isLoggedIn) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for user registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = registrationSchema.parse(req.body);
      
      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        // If user exists already, log them in instead of showing an error
        if (req.session) {
          // Create welcome back message
          const welcomeMessage = {
            role: 'assistant',
            content: `Welcome back, ${existingUser.firstName}! How can I help you with technology today?`
          };
          
          req.session.userId = existingUser.id;
          req.session.email = existingUser.email;
          req.session.firstName = existingUser.firstName;
          req.session.isLoggedIn = true;
          req.session.messages = [welcomeMessage];
          
          return res.status(200).json({ 
            message: "Welcome back!",
            userId: existingUser.id,
            firstName: existingUser.firstName,
            isLoggedIn: true
          });
        } else {
          return res.status(400).json({ 
            message: "A user with this email already exists" 
          });
        }
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Store user info in session
      if (req.session) {
        // Create welcome message
        const welcomeMessage = {
          role: 'assistant',
          content: `Hello ${user.firstName}! I'm the TTwW Answerbot, and I'm here to help answer your questions about technology. Feel free to ask me anything!`
        };
        
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.firstName = user.firstName;
        req.session.isLoggedIn = true;
        req.session.messages = [welcomeMessage];
      }
      
      return res.status(201).json({ 
        message: "Registration successful",
        userId: user.id,
        firstName: user.firstName,
        isLoggedIn: true
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          details: error.format() 
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // API route to check authentication status
  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.isLoggedIn) {
      return res.json({
        isLoggedIn: true,
        userId: req.session.userId,
        firstName: req.session.firstName,
        email: req.session.email
      });
    } else {
      return res.json({
        isLoggedIn: false
      });
    }
  });

  // Get chat history
  app.get("/api/chat/history", isAuthenticated, (req, res) => {
    if (req.session && req.session.messages) {
      return res.json({ messages: req.session.messages });
    } else {
      return res.json({ messages: [] });
    }
  });
  
  // Clear chat history and start new chat
  app.post("/api/chat/clear", isAuthenticated, (req, res) => {
    if (req.session) {
      // Create welcome message
      const welcomeMessage = {
        role: 'assistant',
        content: `Hello ${req.session.firstName || 'there'}! I'm the TTwW Answerbot, and I'm here to help answer your questions about technology. Feel free to ask me anything!`
      };
      
      // Reset messages to just the welcome message
      req.session.messages = [welcomeMessage];
      
      return res.json({ 
        message: 'Chat history cleared',
        messages: [welcomeMessage]
      });
    } else {
      return res.status(500).json({ message: 'Failed to clear chat history' });
    }
  });
  
  // API route for getting AI response - protected by auth
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const body = messageSchema.parse(req.body);
      
      if (!OPENAI_API_KEY) {
        return res.status(500).json({ 
          message: "OpenAI API key is not configured. Please add it to your environment variables." 
        });
      }

      try {
        // Initialize message history if not already present
        if (!req.session.messages) {
          req.session.messages = [];
        }
        
        // Add user message to history
        req.session.messages.push({
          role: 'user',
          content: body.content
        });
        
        // Prepare message history for OpenAI, including only the last 10 messages to keep context reasonable
        const messageHistory = req.session.messages.slice(-10);
        
        // Create properly typed messages for the OpenAI API
        const systemMessage: ChatCompletionMessageParam = { 
          role: "system", 
          content: "You are TTwW Answerbot, a friendly assistant who helps adult learners with entry-level tech skills understand technology better. Follow these guidelines when responding:\n\n1. Use clear, straightforward language that respects the user's intelligence while avoiding unnecessary jargon\n2. Explain concepts at an appropriate level for adults who have basic tech familiarity but want to improve\n3. Use helpful comparisons or analogies to common life experiences that adults would relate to\n4. Break down complex ideas into understandable components without being patronizing\n5. Introduce and briefly explain technical terms to help build the user's vocabulary\n6. Keep answers concise, practical and relevant to everyday use cases\n7. Assume the person has basic tech exposure (smartphones, email, web browsing) but wants deeper understanding\n8. Format responses with clear headings, bullet points, and numbered lists when appropriate to improve readability\n9. Use examples that would resonate with adult learners, rather than classroom scenarios\n10. Be encouraging and patient, acknowledging that technology learning is an ongoing process" 
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
        
        // Call OpenAI API with the new client
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1000
        });

        const aiResponse = completion.choices[0].message.content?.trim() || "Sorry, I couldn't generate a response.";
        
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
