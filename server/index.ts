import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Debug mode to show more detailed logs
const DEBUG = true;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session management
const SessionStore = MemoryStore(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ttw-answerbot-secret",
    resave: false, // Only save session if changed
    saveUninitialized: false, // Don't create session until something stored
    rolling: true, // Reset expiration with each request
    store: new SessionStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      stale: false // Delete expired sessions
    }),
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
      path: '/'
    }
  })
);

// Log all requests for debugging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  if (DEBUG) {
    log(`Request: ${req.method} ${path}`, "express-debug");
  }
  
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || DEBUG) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80 && !DEBUG) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler with better logging
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`[${new Date().toISOString()}] Error:`, err);
    res.status(status).json({ message });
    
    if (DEBUG || process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  });

  // Setup Vite in development mode
  // This is crucial for serving the React app correctly
  await setupVite(app, server);
  
  // Adding a health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running at http://0.0.0.0:${port}`);
    log(`Try accessing the app at http://localhost:${port}`);
  });
})();
