import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema, registrationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    firstName?: string;
    isLoggedIn?: boolean;
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
      
      // Check if user with email already exists (case insensitive)
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        // If user exists already, log them in instead of showing an error
        if (req.session) {
          req.session.userId = existingUser.id;
          req.session.email = existingUser.email;
          req.session.firstName = existingUser.firstName;
          req.session.isLoggedIn = true;
          
          // Force save the session to ensure it persists
          await new Promise<void>((resolve, reject) => {
            req.session.save(err => {
              if (err) reject(err);
              else resolve();
            });
          });
          
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
      
      // Store user info in session with error handling
      if (!req.session) {
        throw new Error("Session middleware not properly initialized. Check session configuration.");
      }
      
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.firstName = user.firstName;
      req.session.isLoggedIn = true;
      
      // Force save the session to ensure it persists
      try {
        await new Promise<void>((resolve, reject) => {
          req.session.save(err => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        console.error("Session save error:", error);
        throw new Error("Failed to persist session");
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
  
  // API route for logging out
  app.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Failed to log out" });
        }
        
        res.clearCookie('connect.sid'); // Clear the session cookie
        return res.json({ message: "Logged out successfully" });
      });
    } else {
      return res.json({ message: "Not logged in" });
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
        // Call OpenAI API with the new client
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const completion = await Promise.race([
          openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
            { 
              role: "system", 
              content: "You are TTwW Answerbot, a friendly assistant who helps adult learners with entry-level tech skills understand technology better. Follow these guidelines when responding:\n\n1. Use clear, straightforward language that respects the user's intelligence while avoiding unnecessary jargon\n2. Explain concepts at an appropriate level for adults who have basic tech familiarity but want to improve\n3. Use helpful comparisons or analogies to common life experiences that adults would relate to\n4. Break down complex ideas into understandable components without being patronizing\n5. Introduce and briefly explain technical terms to help build the user's vocabulary\n6. Keep answers concise, practical and relevant to everyday use cases\n7. Assume the person has basic tech exposure (smartphones, email, web browsing) but wants deeper understanding" 
            },
            { role: "user", content: body.content }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
        new Promise((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('OpenAI API request timed out after 30 seconds'));
          }, 30000);
          return () => clearTimeout(timeoutId);
        })
      ]).catch(error => {
        if (error.message.includes('timed out')) {
          throw new Error('Request timeout. Please try again with a shorter message.');
        }
        throw error;
      }) as OpenAI.Chat.Completions.ChatCompletion;

        const aiResponse = completion.choices[0].message.content?.trim() || "Sorry, I couldn't generate a response.";

        // Store message in memory storage (optional)
        // Actually store both the request and response if needed

        return res.json({ 
          role: "assistant", 
          content: aiResponse 
        });
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
