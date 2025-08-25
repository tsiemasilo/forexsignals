import express from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";

const app = express();
const server = createServer(app);

async function startServer() {
  // Try to add password column if it doesn't exist
  try {
    const { storage } = await import("./storage");
    const bcrypt = await import("bcryptjs");
    
    await storage.addPasswordColumn();
    console.log('✅ Password column migration completed');
    
    // Fix existing accounts with standardized password (except admin)
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const userEmails = [
      "tsiemasilo@gmail.com",
      "almeerahlosper@gmail.com",
      "tsiemasiload@gmail.com"
    ];
    
    for (const email of userEmails) {
      try {
        await storage.updateUserPassword(email, hashedPassword);
        console.log(`✅ Updated password for ${email}`);
      } catch (err) {
        console.log(`⚠️ Could not update ${email} password (user may not exist)`);
      }
    }
    
  } catch (error) {
    console.log('⚠️ Password column migration skipped:', error instanceof Error ? error.message : 'Unknown error');
  }

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