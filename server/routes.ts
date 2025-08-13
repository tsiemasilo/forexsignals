import type { Express, Request, Response } from "express";
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

// Simple session store for demo (in production, use a proper session store)
const sessions = new Map<string, { userId: number; isAdmin: boolean }>();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: any) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
  
  const session = sessions.get(sessionId)!;
  (req as any).userId = session.userId;
  (req as any).isAdmin = session.isAdmin;
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
  // Seed database on startup
  await seedDatabase();
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

      const sessionId = crypto.randomUUID();
      sessions.set(sessionId, { userId: user.id, isAdmin: user.isAdmin || false });
      console.log('Session created:', sessionId, 'for user:', user.id);

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

  app.post("/api/logout", requireAuth, (req: Request, res: Response) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
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

  app.post("/api/subscribe", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { planId } = req.body;
      
      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Create subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      const subscriptionData = {
        userId,
        planId,
        status: "active" as const,
        startDate: new Date(),
        endDate
      };

      const subscription = await storage.createSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription" });
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
        if (!subscription || subscription.status !== "active" || new Date() > subscription.endDate) {
          return res.status(403).json({ message: "Active subscription required" });
        }
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
        if (!subscription || subscription.status !== "active" || new Date() > subscription.endDate) {
          return res.status(403).json({ message: "Active subscription required" });
        }
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

  // Admin endpoints
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
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

      // Generate Ozow payment form data
      const paymentData = {
        SiteCode: process.env.OZOW_SITE_CODE,
        CountryCode: 'ZA',
        CurrencyCode: 'ZAR',
        Amount: (parseFloat(plan.price) * 100).toString(), // Ozow expects amount in cents
        TransactionReference: transactionReference,
        BankReference: plan.name,
        SuccessUrl: `${req.protocol}://${req.get('host')}/payment/success`,
        CancelUrl: `${req.protocol}://${req.get('host')}/payment/cancel`,
        ErrorUrl: `${req.protocol}://${req.get('host')}/payment/error`,
        NotifyUrl: `${req.protocol}://${req.get('host')}/api/ozow/notify`,
        Customer: user.email,
        Optional1: userId.toString(),
        Optional2: planId.toString(),
        Optional3: plan.name,
        IsTest: 'true'
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

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate Ozow signature
function generateOzowSignature(data: Record<string, any>, privateKey: string): string {
  // Ozow signature generation
  const fieldsToInclude = [
    'SiteCode', 'CountryCode', 'CurrencyCode', 'Amount', 'TransactionReference',
    'BankReference', 'Customer', 'Optional1', 'Optional2', 'Optional3', 'IsTest'
  ];
  
  const inputString = fieldsToInclude
    .filter(field => data[field] !== undefined && data[field] !== null && data[field] !== '')
    .map(field => data[field])
    .join('')
    .toLowerCase();

  const stringToHash = inputString + privateKey.toLowerCase();
  
  return crypto.createHash('sha512').update(stringToHash).digest('hex');
}