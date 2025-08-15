import express from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";

const app = express();
const server = createServer(app);

async function startServer() {
  // Register API routes
  await registerRoutes(app);

  // Setup Vite in development or serve static files in production
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000");
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);