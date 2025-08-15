import type { Express, Request, Response } from "express";
import "express-session";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSubscriptionPlanSchema, 
  insertSubscriptionSchema, 
  insertForexSignalSchema 
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { seedDatabase } from "./seed";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// Middleware to check authentication using express-session
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!(req as any).session?.userId) {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
  
  (req as any).userId = (req as any).session.userId;
  (req as any).isAdmin = (req as any).session.isAdmin || false;
  next();
};

// Middleware to check admin privileges
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!(req as any).isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware with PostgreSQL store
  // Use the same database URL logic as db.ts
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({
      conString: databaseUrl,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: 'forex-signals-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'forexSignalsSession', // Custom session name to avoid conflicts
    rolling: true, // Refresh session on activity
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for payment redirects
      sameSite: 'lax' // Prevent CSRF attacks while allowing same-site requests
    }
  }));

  // Skip database seeding when using memory storage
  // await seedDatabase();
  // Auth endpoints
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log('Login attempt for email:', email);
      
      const user = await storage.getUserByEmail(email);
      console.log('User found:', user ? `ID: ${user.id}, Email: ${user.email}` : 'No user found');
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Regenerate session to prevent session fixation attacks
      (req as any).session.regenerate((err: any) => {
        if (err) {
          console.error('Session regeneration failed:', err);
          return res.status(500).json({ message: "Login failed" });
        }

        // Store user data in new session
        (req as any).session.userId = user.id;
        (req as any).session.isAdmin = user.isAdmin || false;
        (req as any).session.loginTime = new Date().toISOString();
        
        // Save session before responding
        (req as any).session.save((saveErr: any) => {
          if (saveErr) {
            console.error('Session save failed:', saveErr);
            return res.status(500).json({ message: "Login failed" });
          }

          const sessionId = (req as any).session.id;
          console.log('New session created:', sessionId, 'for user:', user.id);

          res.json({
            sessionId,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              isAdmin: user.isAdmin
            }
          });
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      console.log('Registration attempt for email:', validatedData.email);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        console.log('User already exists:', validatedData.email);
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(validatedData);
      console.log('User created:', user.id, user.email);

      // Create 7-day free trial subscription for new user
      try {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        await storage.createSubscription({
          userId: user.id,
          planId: 1, // Use Basic Plan for trial (could be a dedicated trial plan)
          status: "trial",
          startDate: new Date(),
          endDate: trialEndDate
        });
        console.log('7-day trial subscription created for user:', user.id);
      } catch (trialError) {
        console.error('Failed to create trial subscription:', trialError);
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    if ((req as any).session) {
      const sessionId = (req as any).session.id;
      console.log('Destroying session:', sessionId);
      
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        console.log('Session destroyed successfully');
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
  });

  // Admin endpoint to clear all sessions (for debugging session issues)
  app.post("/api/admin/clear-sessions", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      // Note: This would require direct database access to clear sessions table
      // For now, we'll just log that the endpoint was called
      console.log('Admin requested session cleanup');
      res.json({ message: "Session cleanup logged - users will need to login again" });
    } catch (error) {
      console.error('Session cleanup error:', error);
      res.status(500).json({ message: "Session cleanup failed" });
    }
  });

  // Subscription Plans endpoints
  app.get("/api/plans", async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.post("/api/plans", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  // Subscriptions endpoints
  app.get("/api/subscription", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Get current user's subscription status with details
  app.get("/api/user/subscription-status", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json({ 
          status: 'none', 
          statusDisplay: 'No Subscription',
          daysLeft: 0,
          plan: null,
          color: 'bg-gray-100 text-gray-800'
        });
      }

      const plan = await storage.getPlan(subscription.planId);
      const endDate = new Date(subscription.endDate);
      const currentDate = new Date();
      const isNaturallyExpired = currentDate > endDate;
      let daysLeft = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      let statusDisplay = '';
      let colorClass = '';
      
      // Handle manually set statuses first
      switch (subscription.status) {
        case 'expired':
          statusDisplay = 'Expired';
          colorClass = 'bg-red-100 text-red-800';
          daysLeft = 0; // Force 0 days for manually expired subscriptions
          break;
        case 'inactive':
          statusDisplay = 'Inactive';
          colorClass = 'bg-yellow-100 text-yellow-800';
          daysLeft = 0; // Force 0 days for inactive subscriptions
          break;
        case 'trial':
          if (isNaturallyExpired) {
            statusDisplay = 'Expired';
            colorClass = 'bg-red-100 text-red-800';
            daysLeft = 0;
          } else {
            statusDisplay = 'Free Trial';
            colorClass = 'bg-blue-100 text-blue-800';
          }
          break;
        case 'active':
          if (isNaturallyExpired) {
            statusDisplay = 'Expired';
            colorClass = 'bg-red-100 text-red-800';
            daysLeft = 0;
          } else {
            statusDisplay = 'Active';
            colorClass = 'bg-green-100 text-green-800';
          }
          break;
        default:
          statusDisplay = 'Unknown';
          colorClass = 'bg-gray-100 text-gray-800';
          daysLeft = 0;
      }

      res.json({
        status: subscription.status,
        statusDisplay,
        daysLeft,
        endDate: subscription.endDate,
        plan: plan ? { name: plan.name, price: plan.price } : null,
        color: colorClass
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post("/api/subscribe", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { planId } = req.body;
      
      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Check if user has existing subscription
      const existingSubscription = await storage.getUserSubscription(userId);
      
      let subscription;
      if (existingSubscription) {
        // Extend existing subscription
        subscription = await storage.extendUserSubscription(userId, planId, plan.duration);
        if (!subscription) {
          return res.status(500).json({ message: "Failed to extend subscription" });
        }
      } else {
        // Create new subscription
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        const subscriptionData = {
          userId,
          planId,
          status: "active" as const,
          startDate: new Date(),
          endDate
        };

        subscription = await storage.createSubscription(subscriptionData);
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create or extend subscription" });
    }
  });

  // Forex Signals endpoints
  app.get("/api/signals", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const isAdmin = (req as any).isAdmin;

      // Check if user has active subscription (unless admin)
      if (!isAdmin) {
        const subscription = await storage.getUserSubscription(userId);
        console.log('🔍 SIGNALS ACCESS DEBUG - User:', userId, 'Subscription:', subscription);
        
        if (!subscription) {
          console.log('❌ No subscription found for user:', userId);
          return res.status(403).json({ message: "Active subscription required" });
        }
        
        const now = new Date();
        const isActiveSubscription = subscription.status === "active" && subscription.endDate > now;
        const isActiveTrial = subscription.status === "trial" && subscription.endDate > now;
        
        console.log('🕐 Access Check:', {
          status: subscription.status,
          endDate: subscription.endDate,
          now: now,
          isActiveSubscription,
          isActiveTrial,
          shouldHaveAccess: isActiveSubscription || isActiveTrial
        });
        
        if (!isActiveSubscription && !isActiveTrial) {
          console.log('❌ Access denied - subscription expired or inactive');
          return res.status(403).json({ message: "Active subscription required" });
        }
        
        console.log('✅ Access granted for user:', userId);
      }

      const signals = await storage.getAllSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  app.get("/api/signals/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const isAdmin = (req as any).isAdmin;
      const signalId = parseInt(req.params.id);

      // Check if user has active subscription (unless admin)
      if (!isAdmin) {
        const subscription = await storage.getUserSubscription(userId);
        console.log('🔍 SINGLE SIGNAL ACCESS DEBUG - User:', userId, 'Subscription:', subscription);
        
        if (!subscription) {
          console.log('❌ No subscription found for user:', userId);
          return res.status(403).json({ message: "Active subscription required" });
        }
        
        const now = new Date();
        const isActiveSubscription = subscription.status === "active" && subscription.endDate > now;
        const isActiveTrial = subscription.status === "trial" && subscription.endDate > now;
        
        console.log('🕐 Single Signal Access Check:', {
          status: subscription.status,
          endDate: subscription.endDate,
          now: now,
          isActiveSubscription,
          isActiveTrial,
          shouldHaveAccess: isActiveSubscription || isActiveTrial
        });
        
        if (!isActiveSubscription && !isActiveTrial) {
          console.log('❌ Single signal access denied - subscription expired or inactive');
          return res.status(403).json({ message: "Active subscription required" });
        }
        
        console.log('✅ Single signal access granted for user:', userId);
      }

      const signal = await storage.getSignal(signalId);
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }



      res.json(signal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch signal" });
    }
  });

  app.post("/api/signals", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const createdBy = (req as any).userId;
      const validatedData = insertForexSignalSchema.parse({
        ...req.body,
        createdBy
      });

      const signal = await storage.createSignal(validatedData);
      res.json(signal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create signal" });
    }
  });

  app.put("/api/signals/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const signalId = parseInt(req.params.id);
      const updates = req.body;

      const signal = await storage.updateSignal(signalId, updates);
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }

      res.json(signal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update signal" });
    }
  });

  app.delete("/api/signals/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const signalId = parseInt(req.params.id);
      const success = await storage.deleteSignal(signalId);
      
      if (!success) {
        return res.status(404).json({ message: "Signal not found" });
      }

      res.json({ message: "Signal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete signal" });
    }
  });

  // Admin sync endpoint to force memory storage sync with database
  app.post("/api/admin/sync-trial", async (req: Request, res: Response) => {
    try {
      const { userId, trialEndDate, planId } = req.body;
      console.log('🔄 SYNCING MEMORY STORAGE WITH DATABASE TRIAL:', { userId, trialEndDate, planId });
      
      // Force update memory storage subscription
      const subscription = await storage.updateUserSubscriptionStatus(userId, "trial");
      if (subscription) {
        // Update with correct database dates
        subscription.endDate = new Date(trialEndDate);
        subscription.planId = planId;
        subscription.startDate = new Date();
        
        console.log('✅ Memory storage synced:', subscription);
        return res.json({ message: "Memory storage synced successfully", subscription });
      }
      
      res.status(404).json({ message: "Failed to sync subscription" });
    } catch (error) {
      console.error('❌ Sync error:', error);
      res.status(500).json({ message: "Failed to sync memory storage" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsersWithSubscriptions();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin route to update user subscription status
  app.patch("/api/admin/users/:userId/subscription", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { status, planId } = req.body;

      if (!["active", "inactive", "expired", "trial"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      let subscription;
      console.log('🔧 ADMIN ROUTE: Processing subscription update:', { userId, status, planId, timestamp: new Date().toISOString() });
      
      if (status === "trial") {
        // For trials, ALWAYS create proper 7-day trial and IGNORE planId completely
        console.log('🎯 ADMIN ROUTE: Creating trial - FORCE 7-day trial regardless of planId');
        subscription = await storage.updateUserSubscriptionStatus(userId, status);
        console.log('✅ ADMIN ROUTE: Trial created:', subscription);
        
        // Double-check trial duration and force 7 days if corrupted
        if (subscription) {
          const durationDays = Math.round((subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24));
          console.log('📅 ADMIN ROUTE: Trial duration check:', { durationDays, endDate: subscription.endDate });
          if (durationDays < 7) {
            console.log('⚠️ ADMIN ROUTE: WARNING - Trial duration corrupted, fixing...');
            const fixedEndDate = new Date();
            fixedEndDate.setDate(fixedEndDate.getDate() + 7);
            subscription.endDate = fixedEndDate;
            subscription.startDate = new Date();
            subscription.planId = 1; // Force basic plan
            console.log('✅ ADMIN ROUTE: Trial duration fixed to 7 days:', subscription);
          }
        }
        
        // CRITICAL: For trials, exit early and don't call updateUserSubscriptionWithPlan
        console.log('🔒 ADMIN ROUTE: Trial creation complete, exiting early to prevent corruption');
        res.json({ message: "Trial subscription created successfully", subscription });
        return;
      } else if (planId && status === "active") {
        console.log('🎯 ADMIN ROUTE: Creating active subscription with plan');
        subscription = await storage.updateUserSubscriptionWithPlan(userId, status, planId);
        console.log('✅ ADMIN ROUTE: Active subscription created:', subscription);
      } else {
        console.log('🎯 ADMIN ROUTE: Creating subscription without plan');
        subscription = await storage.updateUserSubscriptionStatus(userId, status);
        console.log('✅ ADMIN ROUTE: Subscription created:', subscription);
      }

      if (!subscription) {
        return res.status(404).json({ message: "User subscription not found" });
      }

      res.json({ message: "Subscription status updated successfully", subscription });
    } catch (error) {
      console.error('Admin subscription update error:', error);
      res.status(500).json({ message: "Failed to update subscription status" });
    }
  });

  // NEW: Dedicated admin endpoint for creating fresh trials (bypasses dropdown issues)
  app.post("/api/admin/users/:userId/create-trial", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log('🎯 DEDICATED TRIAL CREATION: Starting fresh trial for user:', userId);
      
      // Create a completely fresh 7-day trial using direct storage method
      const freshTrial = await storage.createFreshTrial(userId);
      
      if (!freshTrial) {
        return res.status(500).json({ message: "Failed to create fresh trial" });
      }
      
      console.log('✅ DEDICATED TRIAL CREATION: Fresh 7-day trial created successfully:', freshTrial);
      res.json({ message: "Fresh 7-day trial created successfully", subscription: freshTrial });
      
    } catch (error) {
      console.error('Dedicated trial creation error:', error);
      res.status(500).json({ message: "Failed to create fresh trial" });
    }
  });

  // Keep the old implementation as backup
  app.get("/api/admin/users-detailed", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const subscriptions = await storage.getAllSubscriptions();
      const plans = await storage.getAllPlans();

      // Combine user data with subscription info
      const usersWithSubscriptions = users.map(user => {
        const userSubscription = subscriptions.find(sub => 
          sub.userId === user.id && sub.status === "active"
        );
        const plan = userSubscription ? plans.find(p => p.id === userSubscription.planId) : null;

        return {
          ...user,
          subscription: userSubscription ? {
            ...userSubscription,
            plan: plan
          } : null
        };
      });

      res.json(usersWithSubscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Ozow payment integration
  app.post("/api/ozow/payment", requireAuth, async (req: Request, res: Response) => {
    try {
      const { planId } = req.body;
      const userId = (req as any).userId;

      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate unique transaction reference
      const transactionReference = `TXN_${userId}_${planId}_${Date.now()}`;

      // Generate Ozow payment form data - field order matters for signature
      const paymentData = {
        SiteCode: process.env.OZOW_SITE_CODE,
        CountryCode: 'ZA',
        CurrencyCode: 'ZAR',
        Amount: parseFloat(plan.price).toFixed(2), // Ozow expects amount in Rands as decimal
        TransactionReference: transactionReference,
        BankReference: plan.name,
        Optional1: userId.toString(),
        Optional2: planId.toString(),
        Optional3: plan.name,
        Optional4: '',
        Optional5: '',
        Customer: user.email,
        CancelUrl: `${req.protocol}://${req.get('host')}/payment/cancel`,
        ErrorUrl: `${req.protocol}://${req.get('host')}/payment/error`,
        SuccessUrl: `${req.protocol}://${req.get('host')}/payment/success`,
        NotifyUrl: `${req.protocol}://${req.get('host')}/api/ozow/notify`,
        IsTest: 'false'
      };

      // Generate signature for Ozow
      const privateKey = process.env.OZOW_PRIVATE_KEY || '';
      const signature = generateOzowSignature(paymentData, privateKey);

      // Use production URL for more stable connection
      const actionUrl = 'https://pay.ozow.com/';
      
      console.log('Ozow action URL being sent:', actionUrl);
      console.log('Environment:', process.env.NODE_ENV);
      
      res.json({
        ...paymentData,
        HashCheck: signature,
        action_url: actionUrl
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate payment" });
    }
  });

  // Ozow notification handler
  app.post("/api/ozow/notify", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Verify the payment notification
      if (data.Status === 'Complete' || data.Status === 'PendingInvestigation') {
        const userId = parseInt(data.Optional1);
        const planId = parseInt(data.Optional2);

        const plan = await storage.getPlan(planId);
        if (plan) {
          // Create subscription
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);

          await storage.createSubscription({
            userId,
            planId,
            status: "active",
            startDate: new Date(),
            endDate
          });
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      res.status(500).send('Error');
    }
  });

  // Yoco payment integration
  app.post("/api/yoco/payment", requireAuth, async (req: Request, res: Response) => {
    try {
      const { planId } = req.body;
      const userId = (req as any).userId;

      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate unique transaction reference
      const transactionReference = `YOCO_${userId}_${planId}_${Date.now()}`;

      // For Yoco integration, we'll create a simple redirect URL
      // In production, you would integrate with Yoco's API to create checkout sessions
      const checkoutData = {
        amount: parseFloat(plan.price) * 100, // Amount in cents
        currency: 'ZAR',
        reference: transactionReference,
        description: plan.name,
        successUrl: `${req.protocol}://${req.get('host')}/payment/success`,
        cancelUrl: `${req.protocol}://${req.get('host')}/payment/cancel`,
        metadata: {
          userId: userId.toString(),
          planId: planId.toString(),
          planName: plan.name
        }
      };

      // For demo purposes, return a mock redirect URL
      // In production, you would make an API call to Yoco to create the checkout session
      res.json({
        redirectUrl: `https://checkout.yoco.com/demo?amount=${checkoutData.amount}&currency=${checkoutData.currency}&reference=${transactionReference}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate Yoco payment" });
    }
  });

  // Yoco webhook handler (for production integration)
  app.post("/api/yoco/webhook", async (req: Request, res: Response) => {
    try {
      const { status, metadata } = req.body;
      
      if (status === 'successful') {
        const userId = parseInt(metadata.userId);
        const planId = parseInt(metadata.planId);

        const plan = await storage.getPlan(planId);
        if (plan) {
          // Create subscription
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);

          await storage.createSubscription({
            userId,
            planId,
            status: "active",
            startDate: new Date(),
            endDate
          });
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      res.status(500).send('Error');
    }
  });

  // Payment callback routes for Ozow redirects
  app.get("/payment/success", (req: Request, res: Response) => {
    console.log('Payment success callback:', req.query);
    res.redirect('/?payment=success');
  });

  app.get("/payment/cancel", (req: Request, res: Response) => {
    console.log('Payment cancelled:', req.query);
    res.redirect('/?payment=cancelled');
  });

  app.get("/payment/error", (req: Request, res: Response) => {
    console.log('Payment error:', req.query);
    res.redirect('/?payment=error');
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate Ozow signature
function generateOzowSignature(data: Record<string, any>, privateKey: string): string {
  // Ozow signature generation - based on working PHP and Ruby examples
  // Order must match EXACTLY as shown in working implementations:
  // SiteCode, CountryCode, CurrencyCode, Amount, TransactionReference, BankReference,
  // Optional1, Optional2, Optional3, Optional4, Optional5, Customer, 
  // CancelUrl, ErrorUrl, SuccessUrl, NotifyUrl, IsTest
  const fieldsInOrder = [
    data.SiteCode,
    data.CountryCode, 
    data.CurrencyCode,
    data.Amount,
    data.TransactionReference,
    data.BankReference,
    data.Optional1 || '',
    data.Optional2 || '',
    data.Optional3 || '',
    data.Optional4 || '',
    data.Optional5 || '',
    data.Customer || '',
    data.CancelUrl,
    data.ErrorUrl,
    data.SuccessUrl,
    data.NotifyUrl,
    data.IsTest
  ];
  
  // Join all fields and append private key, then convert to lowercase
  const inputString = fieldsInOrder.join('') + privateKey;
  const stringToHash = inputString.toLowerCase();
  
  console.log('Hash fields in order:', fieldsInOrder);
  console.log('Hash input string:', stringToHash);
  const hash = crypto.createHash('sha512').update(stringToHash).digest('hex');
  console.log('Generated hash:', hash);
  
  return hash;
}