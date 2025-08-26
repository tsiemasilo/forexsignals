import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertUserSchema, insertForexSignalSchema, insertSubscriptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: express.Application): Promise<Server> {
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
  // Database migrations
  try {
    await storage.addTradeOutcomeColumn();
  } catch (error) {
    console.log('Trade outcome column migration error (might already exist):', error);
  }

  // Seed database on startup
  await seedDatabase();

  // Temporary migration route to add password column
  app.post("/api/admin/migrate-password-column", async (req: Request, res: Response) => {
    try {
      // Use raw SQL to add password column
      await storage.addPasswordColumn();
      res.json({ message: "Password column added successfully. Please restart the server." });
    } catch (error: any) {
      console.error('Migration error:', error);
      res.status(500).json({ message: error.message || "Migration failed" });
    }
  });

  // Migration route to add trade outcome column
  app.post("/api/admin/migrate-trade-outcome-column", async (req: Request, res: Response) => {
    try {
      await storage.addTradeOutcomeColumn();
      res.json({ message: "Trade outcome column added successfully." });
    } catch (error: any) {
      console.error('Trade outcome migration error:', error);
      res.status(500).json({ message: error.message || "Migration failed" });
    }
  });

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
      const { email, password } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
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

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // Check if this is the user's first login (no subscription exists)
      const existingSubscription = await storage.getUserSubscription(user.id);
      
      if (!existingSubscription) {
        // First login - create 7-day free trial
        const trial = await storage.createFreshTrial(user.id);
        if (trial) {
          console.log(`✅ Created 7-day trial for first login: ${user.email}`);
        } else {
          console.error('❌ Failed to create trial for user:', user.id);
        }
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
      const { email, password, firstName, lastName } = req.body || {};
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, password, first name, and last name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        return res.status(409).json({ 
          message: "Account already exists. Please sign in instead.",
          userExists: true 
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user WITHOUT logging them in or creating a trial
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: false
      });
      
      console.log(`✅ New user registered: ${user.email} (ID: ${user.id}) - Account created, please sign in`);
      
      // Return success without setting session or user data
      res.json({
        message: "Account created successfully! Please sign in to access your account.",
        registrationComplete: true
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
      // Accept any valid subscription status that's not explicitly expired/cancelled
      const validStatuses = ['active', 'trial', 'basic plan', 'premium plan', 'vip plan'];
      const isActive = validStatuses.includes(subscription.status) && endDate > now;
      
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
      const userId = req.session.userId!;
      const signalId = parseInt(req.params.id);
      
      console.log(`🔍 INDIVIDUAL SIGNAL ACCESS DEBUG - User: ${userId}, Signal: ${signalId}`);
      
      // Check if user is admin - admins bypass subscription checks
      const user = await storage.getUser(userId);
      if (user?.isAdmin) {
        console.log(`✅ Admin access granted for signal: ${signalId}`);
        const signal = await storage.getSignal(signalId);
        if (!signal) {
          return res.status(404).json({ message: "Signal not found" });
        }
        return res.json(signal);
      }
      
      // Check subscription status for regular users
      const subscription = await storage.getUserSubscription(userId);
      console.log(`📋 Subscription check for signal ${signalId}:`, subscription);
      
      if (!subscription) {
        console.log(`❌ No subscription found for user: ${userId}`);
        return res.status(403).json({ message: "Active subscription required to view signal details" });
      }

      const now = new Date();
      const endDate = new Date(subscription.endDate);
      // Accept any valid subscription status that's not explicitly expired/cancelled
      const validStatuses = ['active', 'trial', 'basic plan', 'premium plan', 'vip plan'];
      const isActive = validStatuses.includes(subscription.status) && endDate > now;
      
      if (!isActive) {
        console.log(`❌ Inactive subscription for user: ${userId}, status: ${subscription.status}, endDate: ${endDate}`);
        return res.status(403).json({ message: "Active subscription required to view signal details" });
      }

      console.log(`✅ Access granted for signal: ${signalId}`);
      
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
      
      // Clean update data - only include valid fields
      const cleanUpdateData = {
        title: updateData.title,
        content: updateData.content,
        tradeAction: updateData.tradeAction,
        ...(updateData.tradeOutcome && { tradeOutcome: updateData.tradeOutcome }),
        ...(updateData.imageUrl && { imageUrl: updateData.imageUrl }),
        // Handle imageUrls as JSON array
        ...(updateData.imageUrls && Array.isArray(updateData.imageUrls) && updateData.imageUrls.length > 0 && { 
          imageUrls: JSON.stringify(updateData.imageUrls) 
        })
      };
      
      const signal = await storage.updateSignal(signalId, cleanUpdateData);
      
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      res.json(signal);
    } catch (error) {
      console.error('❌ Admin signal update error:', error);
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

  // Trade statistics endpoint
  app.get("/api/trade-stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      console.log(`🔍 TRADE STATS DEBUG - User: ${userId}`);
      
      // Check if user is admin - admins can see all stats
      const user = await storage.getUser(userId);
      console.log(`📋 User found: ${user ? 'Yes' : 'No'}, IsAdmin: ${user?.isAdmin}`);
      
      if (!user?.isAdmin) {
        // Regular users need active subscription
        const subscription = await storage.getUserSubscription(userId);
        console.log(`📋 Subscription found:`, subscription);
        
        if (!subscription) {
          console.log('❌ No subscription found');
          return res.status(403).json({ message: "Active subscription required" });
        }
        
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        const validStatuses = ['active', 'trial', 'basic plan', 'premium plan', 'vip plan'];
        const isActive = validStatuses.includes(subscription.status) && endDate > now;
        
        console.log(`📋 Subscription status: ${subscription.status}, Active: ${isActive}`);
        
        if (!isActive) {
          console.log('❌ Subscription not active');
          return res.status(403).json({ message: "Active subscription required" });
        }
      }
      
      console.log('✅ Access granted for trade stats');
      const stats = await storage.getTradeStats();
      console.log(`📊 Trade stats result:`, stats);
      res.json(stats);
    } catch (error) {
      console.error('Trade stats error:', error);
      res.status(500).json({ message: "Failed to fetch trade statistics" });
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

  // Ozow payment endpoint - Complete rewrite with SHA512
  app.post("/api/ozow/payment", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { planId } = req.body;
      
      const user = await storage.getUser(userId);
      const plan = await storage.getPlan(planId);
      
      if (!user || !plan) {
        return res.status(404).json({ message: "User or plan not found" });
      }

      const privateKey = process.env.OZOW_SECRET_KEY || '';
      if (!privateKey) {
        throw new Error('OZOW_SECRET_KEY not configured');
      }

      const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://watchlistfx.netlify.app';
      
      // Fresh Ozow payment data following official documentation
      const ozowParams = {
        SiteCode: "NOS-NOS-005",
        CountryCode: "ZA", 
        CurrencyCode: "ZAR",
        Amount: parseFloat(plan.price).toFixed(2), // Must be decimal format like 99.99
        TransactionReference: `WFX-${user.id}-${plan.id}-${Date.now()}`,
        BankReference: "WatchlistFx Payment",
        Customer: user.email,
        RequestId: `req-${Date.now()}`,
        IsTest: "false", // Production mode
        SuccessUrl: `${origin}/payment-success`,
        CancelUrl: `${origin}/payment-cancel`,
        ErrorUrl: `${origin}/payment-error`, 
        NotifyUrl: `${origin}/api/ozow/notify`
      };

      // WORKING RUBY GITHUB IMPLEMENTATION ORDER (compact_blank removes empty values):
      // From Ruby code: SiteCode, CountryCode, CurrencyCode, Amount, TransactionReference, BankReference, 
      // [Optional1-5 removed by compact_blank], Customer, CancelUrl, ErrorUrl, SuccessUrl, NotifyUrl, IsTest, PrivateKey
      
      // Note: Ruby compact_blank removes nil values, so we only include non-empty fields
      const hashParams = [
        ozowParams.SiteCode,                // 'SiteCode': 'SOME_SITE_CODE'
        ozowParams.CountryCode,             // 'CountryCode': 'ZA'  
        ozowParams.CurrencyCode,            // 'CurrencyCode': 'ZAR'
        ozowParams.Amount,                  // 'Amount': 1000
        ozowParams.TransactionReference,    // 'TransactionReference': 'SOME_TEST'
        ozowParams.BankReference,           // 'BankReference': "Nice Reference"
        // Optional1-5 are nil in Ruby, so compact_blank removes them
        ozowParams.Customer,                // 'Customer': nil -> but we have email, so include it
        ozowParams.CancelUrl,               // 'CancelUrl': 'https://www.example.com/webhooks/ozow/success'
        ozowParams.ErrorUrl,                // 'ErrorUrl': 'https://www.example.com/webhooks/ozow/error'  
        ozowParams.SuccessUrl,              // 'SuccessUrl': 'https://www.example.com/webhooks/ozow/success'
        ozowParams.NotifyUrl,               // 'NotifyUrl': 'https://www.example.com/webhooks/ozow/notify'
        ozowParams.IsTest,                  // "IsTest": true
        privateKey                          // + "SOME_SECRET_KEY"
      ];
      
      const hashString = hashParams.join('');

      // 3. Convert to lowercase 
      const lowerHashString = hashString.toLowerCase();

      // 4. Generate SHA512 hash (not SHA256!)
      const hashCheck = crypto.createHash('sha512').update(lowerHashString).digest('hex');

      console.log('🎯 RUBY GITHUB IMPLEMENTATION (compact_blank - no empty optionals):', {
        algorithm: 'SHA512',
        originalStringLength: hashString.length,
        lowerStringLength: lowerHashString.length,
        hashLength: hashCheck.length,
        hashPreview: hashCheck.substring(0, 32) + '...',
        parameterOrder: 'SiteCode→Country→Currency→Amount→TxnRef→BankRef→Customer→CancelUrl→ErrorUrl→SuccessUrl→NotifyUrl→IsTest→PrivateKey',
        privateKeyPresent: !!privateKey,
        optionalsSkipped: 'Ruby compact_blank removes Optional1-5'
      });

      const ozowPayment = {
        action_url: "https://pay.ozow.com",
        ...ozowParams,
        HashCheck: hashCheck
      };

      res.json(ozowPayment);
    } catch (error) {
      console.error('Ozow payment error:', error);
      res.status(500).json({ message: "Failed to create Ozow payment" });
    }
  });

  // Ozow notification webhook with proper SHA512 verification
  app.post("/api/ozow/notify", async (req: Request, res: Response) => {
    try {
      console.log('🔔 Ozow notification received:', req.body);
      
      const privateKey = process.env.OZOW_SECRET_KEY || '';
      const notificationData = req.body;
      
      // Verify notification authenticity using SHA512
      if (privateKey && notificationData.Hash) {
        // Create hash string from notification data (excluding Hash field)
        const notificationFields = Object.keys(notificationData)
          .filter(key => key !== 'Hash')
          .sort() // Ensure consistent order
          .map(key => notificationData[key])
          .join('') + privateKey;
          
        const expectedHash = crypto.createHash('sha512')
          .update(notificationFields.toLowerCase())
          .digest('hex');
          
        if (expectedHash !== notificationData.Hash.toLowerCase()) {
          console.error('❌ Ozow notification hash mismatch');
          return res.status(400).send('Invalid notification');
        }
        
        console.log('✅ Ozow notification hash verified');
      }
      
      const { TransactionReference, Status } = notificationData;
      
      if (Status === "Complete") {
        // Parse transaction reference: WFX-userId-planId-timestamp
        const parts = TransactionReference.split('-');
        const userId = parseInt(parts[1]);
        const planId = parseInt(parts[2]);
        
        console.log(`💰 Ozow payment successful for user ${userId}, plan ${planId}`);
        
        // Update user subscription with proper duration
        const plan = await storage.getPlan(planId);
        if (plan && userId && planId) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);
          
          await storage.updateUserSubscriptionStatus(
            userId, 
            planId, 
            'active', 
            endDate
          );
          
          console.log(`✅ Ozow: User ${userId} activated with ${plan.name} (${plan.duration} days) until ${endDate.toISOString()}`);
        } else {
          console.error(`❌ Ozow: Invalid plan or user data - userId: ${userId}, planId: ${planId}`);
        }
      } else {
        console.log(`📋 Ozow payment status: ${Status} for transaction ${TransactionReference}`);
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Ozow notification error:', error);
      res.status(500).json({ message: "Failed to process notification" });
    }
  });

  // Yoco payment webhook for successful payments
  app.post("/api/yoco/notify", async (req: Request, res: Response) => {
    try {
      console.log('🔔 Yoco notification received:', req.body);
      
      const { type, payload } = req.body;
      
      if (type === 'payment.succeeded' && payload) {
        const { metadata } = payload;
        
        if (metadata && metadata.userId && metadata.planId) {
          const userId = parseInt(metadata.userId);
          const planId = parseInt(metadata.planId);
          
          console.log(`💰 Yoco payment successful for user ${userId}, plan ${planId}`);
          
          // Update user subscription
          const plan = await storage.getPlan(planId);
          if (plan && userId && planId) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.duration);
            
            await storage.updateUserSubscriptionStatus(
              userId, 
              planId, 
              'active', 
              endDate
            );
            
            console.log(`✅ Yoco: User ${userId} activated with ${plan.name} (${plan.duration} days) until ${endDate.toISOString()}`);
          } else {
            console.error(`❌ Yoco: Invalid plan or user data - userId: ${userId}, planId: ${planId}`);
          }
        } else {
          console.log('📋 Yoco payment succeeded but missing user/plan metadata');
        }
      } else {
        console.log(`📋 Yoco notification type: ${type}`);
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Yoco notification error:', error);
      res.status(500).json({ message: "Failed to process Yoco notification" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

export default registerRoutes;