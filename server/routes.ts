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
          messages: [
            { 
              role: "system", 
              content: "You are TTwW Answerbot, a friendly assistant who helps people understand technology. Follow these guidelines when responding:\n\n1. Use simple, everyday language and avoid technical jargon\n2. Explain concepts as if talking to someone with no technical background\n3. Use helpful comparisons or analogies to everyday objects or experiences\n4. Break down complex ideas into small, easy-to-understand pieces\n5. When technical terms are necessary, briefly explain what they mean\n6. Keep answers concise and friendly\n7. Assume the person is completely new to technology" 
            },
            { role: "user", content: body.content }
          ],
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
