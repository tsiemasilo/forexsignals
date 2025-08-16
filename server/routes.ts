import express, { Request, Response } from "express";
import session from "express-session";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertUserSchema, insertForexSignalSchema, insertSubscriptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: express.Application) {
  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));
  // Seed database on startup
  await seedDatabase();

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };

  // Auth endpoints
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      console.log('Login request body:', req.body);
      const { email } = req.body || {};
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find or create user
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        const [firstName, lastName] = email.split('@')[0].split('.').map((name: string) => 
          name.charAt(0).toUpperCase() + name.slice(1)
        );
        
        user = await storage.createUser({
          email,
          firstName: firstName || "User",
          lastName: lastName || "Name",
          isAdmin: false
        });
      }

      // Set session
      req.session.userId = user.id;
      
      console.log(`✅ User logged in: ${user.email} (ID: ${user.id})`);
      
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

  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

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
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription endpoints
  app.get("/api/user/subscription-status", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      console.log(`🔍 SUBSCRIPTION STATUS DEBUG - User: ${userId}`);
      
      // Check if user is admin - admins get admin status
      const user = await storage.getUser(userId);
      if (user?.isAdmin) {
        return res.json({
          status: "admin",
          statusDisplay: "Admin Account",
          daysLeft: 999,
          plan: { name: "Admin", price: "0.00" },
          color: "bg-purple-100 text-purple-800"
        });
      }
      
      const subscription = await storage.getUserSubscription(userId);
      console.log(`📋 Subscription found:`, subscription);
      
      if (!subscription) {
        return res.json({
          status: "none",
          statusDisplay: "No Subscription",
          daysLeft: 0,
          plan: null,
          color: "bg-gray-100 text-gray-800"
        });
      }

      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Get plan details
      const plan = await storage.getPlan(subscription.planId);
      
      let status = subscription.status;
      let statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
      let color = "bg-gray-100 text-gray-800";
      
      if (subscription.status === 'active' || (subscription.status === 'trial' && daysLeft > 0)) {
        color = "bg-green-100 text-green-800";
        statusDisplay = subscription.status === 'trial' ? `Trial (${daysLeft} days left)` : "Active";
      } else if (daysLeft <= 0) {
        status = "expired";
        statusDisplay = "Expired";
        color = "bg-red-100 text-red-800";
      }

      res.json({
        status,
        statusDisplay,
        daysLeft,
        endDate: subscription.endDate,
        plan: plan ? {
          name: plan.name,
          price: plan.price
        } : null,
        color
      });
    } catch (error) {
      console.error('Subscription status error:', error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // Signals endpoints
  app.get("/api/signals", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      console.log(`🔍 SIGNALS ACCESS DEBUG - User: ${userId}`);
      
      // Check if user is admin - admins bypass subscription checks
      const user = await storage.getUser(userId);
      if (user?.isAdmin) {
        console.log(`✅ Admin access granted for user: ${userId}`);
        const signals = await storage.getAllSignals();
        return res.json(signals);
      }
      
      // Check subscription status for regular users
      const subscription = await storage.getUserSubscription(userId);
      console.log(`📋 Subscription:`, subscription);
      
      if (!subscription) {
        console.log(`❌ No subscription found for user: ${userId}`);
        return res.status(403).json({ message: "Active subscription required" });
      }

      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const isActive = (subscription.status === 'active' || subscription.status === 'trial') && endDate > now;
      
      if (!isActive) {
        console.log(`❌ Inactive subscription for user: ${userId}, status: ${subscription.status}, endDate: ${endDate}`);
        return res.status(403).json({ message: "Active subscription required" });
      }

      console.log(`✅ Access granted for user: ${userId}`);
      
      const signals = await storage.getAllSignals();
      res.json(signals);
    } catch (error) {
      console.error('Signals fetch error:', error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  app.get("/api/signals/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const signalId = parseInt(req.params.id);
      const signal = await storage.getSignal(signalId);
      
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      res.json(signal);
    } catch (error) {
      console.error('Signal fetch error:', error);
      res.status(500).json({ message: "Failed to fetch signal" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsersWithSubscriptions();
      res.json(users);
    } catch (error) {
      console.error('Admin users fetch error:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/plans", requireAdmin, async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error('Admin plans fetch error:', error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.post("/api/admin/users/:userId/subscription", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { planId, status, duration } = req.body;
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      
      const subscription = await storage.updateUserSubscriptionStatus(userId, planId, status, endDate);
      
      if (!subscription) {
        return res.status(500).json({ message: "Failed to update subscription" });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error('Admin subscription update error:', error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.post("/api/admin/users/:userId/create-trial", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log(`🆕 Creating fresh trial for user: ${userId}`);
      
      const subscription = await storage.createFreshTrial(userId);
      
      if (!subscription) {
        return res.status(500).json({ message: "Failed to create trial" });
      }
      
      console.log(`✅ Fresh trial created successfully for user: ${userId}`);
      res.json(subscription);
    } catch (error) {
      console.error('Admin trial creation error:', error);
      res.status(500).json({ message: "Failed to create trial" });
    }
  });

  app.put("/api/admin/users/:userId/subscription", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { status, planName } = req.body;
      
      console.log(`🔄 Updating subscription for user: ${userId}, status: ${status}, plan: ${planName}`);
      
      if (status === "expired") {
        // Set subscription to expired
        await storage.expireUserSubscription(userId);
        console.log(`❌ Set user ${userId} subscription to expired`);
        res.json({ message: "Subscription set to expired" });
      } else if (status === "active" && planName) {
        // Create active subscription with specified plan
        await storage.createActiveSubscription(userId, planName);
        console.log(`✅ Created active ${planName} subscription for user ${userId}`);
        res.json({ message: `Active ${planName} subscription created` });
      } else {
        res.status(400).json({ message: "Invalid subscription parameters" });
      }
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.get("/api/admin/signals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const signals = await storage.getAllSignals();
      res.json(signals);
    } catch (error) {
      console.error('Admin signals fetch error:', error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  app.post("/api/admin/signals", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      console.log('📥 Raw request body:', { title: req.body.title, hasImages: !!req.body.imageUrls });
      
      // Handle image upload - store first image as imageUrl for now
      let imageUrl = req.body.imageUrl || null;
      if (req.body.imageUrls && Array.isArray(req.body.imageUrls) && req.body.imageUrls.length > 0) {
        // Use the first uploaded image as the main image
        imageUrl = req.body.imageUrls[0];
        console.log('📸 Using first uploaded image as main image');
      }
      
      let processedBody = {
        title: req.body.title,
        content: req.body.content,
        tradeAction: req.body.tradeAction,
        imageUrl: imageUrl
      };
      
      const validatedData = insertForexSignalSchema.parse({
        ...processedBody,
        createdBy: userId
      });
      
      const signal = await storage.createSignal(validatedData);
      console.log('✅ Signal created successfully:', signal.id);
      res.json(signal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('❌ Validation error:', error.errors);
        return res.status(400).json({ message: "Invalid signal data", errors: error.errors });
      }
      console.error('❌ Admin signal creation error:', error);
      res.status(500).json({ message: "Failed to create signal" });
    }
  });

  app.put("/api/admin/signals/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const signalId = parseInt(req.params.id);
      const updateData = req.body;
      
      const signal = await storage.updateSignal(signalId, updateData);
      
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      res.json(signal);
    } catch (error) {
      console.error('Admin signal update error:', error);
      res.status(500).json({ message: "Failed to update signal" });
    }
  });

  app.delete("/api/admin/signals/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const signalId = parseInt(req.params.id);
      const success = await storage.deleteSignal(signalId);
      
      if (!success) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      res.json({ message: "Signal deleted successfully" });
    } catch (error) {
      console.error('Admin signal deletion error:', error);
      res.status(500).json({ message: "Failed to delete signal" });
    }
  });
}

export default registerRoutes;