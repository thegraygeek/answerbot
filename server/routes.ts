import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { messageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "";

// Create OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for getting AI response
  app.post("/api/chat", async (req, res) => {
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
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: body.content }],
          temperature: 0.7,
          max_tokens: 1000
        });

        const aiResponse = completion.choices[0].message.content?.trim() || "Sorry, I couldn't generate a response.";

        // Store message in memory storage (optional)
        // Actually store both the request and response if needed

        return res.json({ 
          role: "assistant", 
          content: aiResponse 
        });
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        return res.status(500).json({ 
          message: "Error from OpenAI API", 
          details: openaiError.message 
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
