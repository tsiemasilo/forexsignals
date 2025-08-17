import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { seedDatabase } from "./seed";

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Basic middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS for development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });
  }

  // Clean session setup
  app.use(session({
    secret: 'forex-simple-auth',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
    name: 'authsession'
  }));

  await seedDatabase();

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Simple login endpoint - email only
  app.post("/api/login", async (req: Request, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set session
      req.session.userId = user.id;
      
      // Return user data
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('authsession');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Subscription status
  app.get("/api/user/subscription-status", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Check if user is admin
      const user = await storage.getUser(userId);
      if (user?.isAdmin) {
        return res.json({
          status: "admin",
          statusDisplay: "Admin",
          daysLeft: null,
          endDate: null,
          plan: { name: "Admin Access", price: "N/A" },
          color: "bg-purple-100 text-purple-800"
        });
      }

      // Get active subscription
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json({
          status: "none",
          statusDisplay: "No Plan",
          daysLeft: 0,
          endDate: null,
          plan: null,
          color: "bg-gray-100 text-gray-800"
        });
      }

      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      const plan = await storage.getPlan(subscription.planId);
      
      res.json({
        status: subscription.status,
        statusDisplay: subscription.status === 'active' ? 'Active' : 'Expired',
        daysLeft,
        endDate: subscription.endDate,
        plan: plan ? { name: plan.name, price: plan.price } : null,
        color: subscription.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get subscription status" });
    }
  });

  // Get forex signals
  app.get("/api/signals", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      // Admin users get all signals
      if (user?.isAdmin) {
        const signals = await storage.getAllSignals();
        return res.json({ signals });
      }

      // Check if user has active subscription
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ message: "Active subscription required" });
      }

      const signals = await storage.getAllSignals();
      res.json({ signals });
    } catch (error) {
      res.status(500).json({ message: "Failed to get signals" });
    }
  });

  // Admin endpoints
  const requireAdmin = async (req: Request, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Admin verification failed" });
    }
  };

  // Admin - Create signal
  app.post("/api/admin/signals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { content, tradeAction, imageUrl } = req.body;
      
      if (!content || !tradeAction) {
        return res.status(400).json({ message: "Content and trade action are required" });
      }

      const signal = await storage.createSignal({
        content,
        trade_action: tradeAction.toLowerCase(),
        image_url: imageUrl || null
      });

      res.json({ signal });
    } catch (error) {
      res.status(500).json({ message: "Failed to create signal" });
    }
  });

  // Admin - Get all signals
  app.get("/api/admin/signals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const signals = await storage.getAllSignals();
      res.json({ signals });
    } catch (error) {
      res.status(500).json({ message: "Failed to get signals" });
    }
  });

  // Admin - Delete signal
  app.delete("/api/admin/signals/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const signalId = parseInt(req.params.id);
      await storage.deleteSignal(signalId);
      res.json({ message: "Signal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete signal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}