import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema, registrationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { getChatResponse } from "./openai";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    firstName?: string;
    isLoggedIn?: boolean;
  }
}

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
  app.post("/api/chat", async (req, res) => {
    try {
      const body = messageSchema.parse(req.body);
      
      try {
        // Get response from OpenAI using our service
        const aiResponse = await getChatResponse(body.content);
        
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
