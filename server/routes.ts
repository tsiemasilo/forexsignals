import express, { Request, Response } from "express";
import session from "express-session";
import crypto from "crypto";
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

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // User doesn't exist - redirect to register
        return res.status(404).json({ 
          message: "Account not found. Please register first to create your account.",
          needsRegistration: true 
        });
      }

      // Set session for existing user
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

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      console.log('Register request body:', req.body);
      const { email, firstName, lastName } = req.body || {};
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        return res.status(409).json({ 
          message: "Account already exists. Please sign in instead.",
          userExists: true 
        });
      }

      // Create new user
      const user = await storage.createUser({
        email,
        firstName,
        lastName,
        isAdmin: false
      });

      // Create 7-day free trial for new user
      const trial = await storage.createFreshTrial(user.id);
      if (!trial) {
        console.error('❌ Failed to create trial for new user:', user.id);
      } else {
        console.log(`✅ Created 7-day trial for new user: ${user.email}`);
      }

      // Set session for new user
      req.session.userId = user.id;
      
      console.log(`✅ New user registered: ${user.email} (ID: ${user.id})`);
      
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
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
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
      const validatedData = insertForexSignalSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      const signal = await storage.createSignal(validatedData);
      res.json(signal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid signal data", errors: error.errors });
      }
      console.error('Admin signal creation error:', error);
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

  // Admin user management endpoints
  app.delete("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session.userId!;
      
      // Prevent admin from deleting themselves
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found or deletion failed" });
      }
      
      res.json({ message: "User account and all associated data deleted successfully" });
    } catch (error) {
      console.error('Admin user deletion error:', error);
      res.status(500).json({ message: "Failed to delete user account" });
    }
  });

  app.post("/api/admin/users/:id/promote", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      const updatedUser = await storage.promoteUserToAdmin(userId);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found or promotion failed" });
      }
      
      res.json({ 
        message: "User promoted to admin successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isAdmin: updatedUser.isAdmin
        }
      });
    } catch (error) {
      console.error('Admin user promotion error:', error);
      res.status(500).json({ message: "Failed to promote user to admin" });
    }
  });

  // Public plans endpoint
  app.get("/api/plans", async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error('Plans fetch error:', error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // Yoco payment endpoint
  app.post("/api/yoco/payment", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { planId } = req.body;
      
      const user = await storage.getUser(userId);
      const plan = await storage.getPlan(planId);
      
      if (!user || !plan) {
        return res.status(404).json({ message: "User or plan not found" });
      }

      // For now, return the direct checkout URLs since they're hardcoded in the frontend
      // In a full implementation, you would create a Yoco payment session here
      const checkoutUrls = {
        1: "https://c.yoco.com/checkout/ch_PLmQ2BJ7wp8h3Qu4Z9F1l6Lm", // Basic Plan
        2: "https://c.yoco.com/checkout/ch_QLOBkND8RDvfb3Vh207tyk0x", // Premium Plan
        3: "https://pay.yoco.com/r/mEQXAD" // VIP Plan
      };

      const redirectUrl = checkoutUrls[planId as keyof typeof checkoutUrls];
      
      if (!redirectUrl) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      res.json({ redirectUrl });
    } catch (error) {
      console.error('Yoco payment error:', error);
      res.status(500).json({ message: "Failed to create Yoco payment" });
    }
  });

  // Ozow payment endpoint
  app.post("/api/ozow/payment", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { planId } = req.body;
      
      const user = await storage.getUser(userId);
      const plan = await storage.getPlan(planId);
      
      if (!user || !plan) {
        return res.status(404).json({ message: "User or plan not found" });
      }

      // Create Ozow payment request
      
      // Get the proper origin URL
      const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://watchlistfx.netlify.app';
      
      // Create clean Ozow payment data - try test mode first
      const ozowData = {
        SiteCode: "NOS-NOS-005",
        CountryCode: "ZA",
        CurrencyCode: "ZAR", 
        Amount: (parseFloat(plan.price) * 100).toString(),
        TransactionReference: `WFX-${user.id}-${plan.id}-${Date.now()}`,
        BankReference: "WatchlistFx Payment",
        Customer: user.email,
        RequestId: `req-${Date.now()}`,
        IsTest: "true", // Try test mode first to validate
        SuccessUrl: `${origin}/payment-success`,
        CancelUrl: `${origin}/payment-cancel`, 
        ErrorUrl: `${origin}/payment-error`,
        NotifyUrl: `${origin}/api/ozow/notify`
      };

      // Try Ozow hash with uppercase format and exact parameter order
      // Based on common South African payment gateway patterns
      const secretKey = process.env.OZOW_SECRET_KEY || '';
      
      // Method A: Exact Ozow documentation order with uppercase
      const ozowHashString = 
        ozowData.SiteCode +
        ozowData.CountryCode +
        ozowData.CurrencyCode +
        ozowData.Amount +
        ozowData.TransactionReference +
        ozowData.BankReference +
        ozowData.Customer +
        ozowData.RequestId +
        ozowData.IsTest +
        ozowData.SuccessUrl +
        ozowData.CancelUrl +
        ozowData.ErrorUrl +
        ozowData.NotifyUrl +
        secretKey;
      const hashA = crypto.createHash('sha256').update(ozowHashString).digest('hex').toUpperCase();
      
      // Method B: Without URLs (minimal approach)
      const minimalString = 
        ozowData.SiteCode +
        ozowData.CountryCode +
        ozowData.CurrencyCode +
        ozowData.Amount +
        ozowData.TransactionReference +
        ozowData.BankReference +
        ozowData.Customer +
        secretKey;
      const hashB = crypto.createHash('sha256').update(minimalString).digest('hex').toUpperCase();
      
      // Method C: MD5 hash (some older systems use this)
      const hashC = crypto.createHash('md5').update(ozowHashString).digest('hex').toUpperCase();
      
      // Try Method B (minimal parameters) - often what SA gateways expect
      const hashCheck = hashB;
      
      console.log('🔐 Ozow hash attempts (uppercase):', {
        methodA: { type: 'SHA256-FULL-UPPER', length: ozowHashString.length, hash: hashA.substring(0, 12) + '...' },
        methodB: { type: 'SHA256-MINIMAL-UPPER', length: minimalString.length, hash: hashB.substring(0, 12) + '...' },
        methodC: { type: 'MD5-FULL-UPPER', length: ozowHashString.length, hash: hashC.substring(0, 12) + '...' },
        selected: 'B (SHA256-MINIMAL-UPPER)',
        secretKeyPresent: !!secretKey
      });

      const ozowPayment = {
        action_url: "https://pay.ozow.com",
        ...ozowData,
        HashCheck: hashCheck
      };

      res.json(ozowPayment);
    } catch (error) {
      console.error('Ozow payment error:', error);
      res.status(500).json({ message: "Failed to create Ozow payment" });
    }
  });

  // Ozow notification webhook
  app.post("/api/ozow/notify", async (req: Request, res: Response) => {
    try {
      console.log('Ozow notification received:', req.body);
      
      // In production, verify the notification signature
      const { TransactionReference, Status } = req.body;
      
      if (Status === "Complete") {
        // Parse transaction reference to get user and plan info
        const [userId, planId] = TransactionReference.split('-');
        
        // Update user subscription
        const plan = await storage.getPlan(parseInt(planId));
        if (plan) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);
          
          await storage.updateUserSubscriptionStatus(
            parseInt(userId), 
            parseInt(planId), 
            'active', 
            endDate
          );
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Ozow notification error:', error);
      res.status(500).json({ message: "Failed to process notification" });
    }
  });
}

export default registerRoutes;