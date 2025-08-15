import { 
  users, subscriptionPlans, subscriptions, forexSignals,
  type User, type InsertUser, type SubscriptionPlan, type InsertSubscriptionPlan,
  type Subscription, type InsertSubscription, type ForexSignal, type InsertForexSignal
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllUsersWithSubscriptions(): Promise<any[]>;

  // Subscription Plans
  getAllPlans(): Promise<SubscriptionPlan[]>;
  getPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Subscriptions
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined>;
  updateUserSubscriptionStatus(userId: number, status: string): Promise<Subscription | undefined>;
  updateUserSubscriptionWithPlan(userId: number, status: string, planId?: number): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  extendUserSubscription(userId: number, planId: number, additionalDays: number): Promise<Subscription | undefined>;
  createFreshTrial(userId: number): Promise<Subscription | undefined>;

  // Forex Signals
  getAllSignals(): Promise<ForexSignal[]>;
  getSignal(id: number): Promise<ForexSignal | undefined>;
  createSignal(signal: InsertForexSignal): Promise<ForexSignal>;
  updateSignal(id: number, updates: Partial<InsertForexSignal>): Promise<ForexSignal | undefined>;
  deleteSignal(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private subscriptions: Map<number, Subscription>;
  private forexSignals: Map<number, ForexSignal>;
  private currentUserId: number;
  private currentPlanId: number;
  private currentSubscriptionId: number;
  private currentSignalId: number;

  constructor() {
    this.users = new Map();
    this.subscriptionPlans = new Map();
    this.subscriptions = new Map();
    this.forexSignals = new Map();
    this.currentUserId = 1;
    this.currentPlanId = 1;
    this.currentSubscriptionId = 1;
    this.currentSignalId = 1;

    this.seedData();
  }

  private seedData() {
    // Create admin user
    const admin: User = {
      id: this.currentUserId++,
      email: "admin@forexsignals.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(admin.id, admin);

    // Create sample customer
    const customer: User = {
      id: this.currentUserId++,
      email: "customer@example.com",
      firstName: "John",
      lastName: "Doe",
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(customer.id, customer);

    // Add Almeerah as regular customer user
    const almeerah: User = {
      id: this.currentUserId++,
      email: "almeerahlosper@gmail.com",
      firstName: "Almeerah",
      lastName: "Losper",
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(almeerah.id, almeerah);

    // Create subscription plans
    const plans = [
      { name: "Basic Plan", description: "One quality signal per day + market analysis", price: "49.99", duration: 5 },
      { name: "Premium Plan", description: "One quality signal per day + market analysis", price: "99.99", duration: 14 },
      { name: "VIP Plan", description: "One quality signal per day + market analysis", price: "179.99", duration: 30 }
    ];

    plans.forEach(planData => {
      const plan: SubscriptionPlan = {
        ...planData,
        id: this.currentPlanId++,
        createdAt: new Date(),
      };
      this.subscriptionPlans.set(plan.id, plan);
    });

    // Create sample subscription for customer
    const subscription: Subscription = {
      id: this.currentSubscriptionId++,
      userId: customer.id,
      planId: 1,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
    };
    this.subscriptions.set(subscription.id, subscription);

    // Create sample forex signals
    const signals = [
      {
        title: "EUR/USD Long Position",
        content: "Strong bullish momentum on EUR/USD. Entry at 1.0950, Stop Loss at 1.0900, Take Profit at 1.1050. Risk/Reward ratio 1:2",
        tradeAction: "Buy",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        createdBy: admin.id,
        isActive: true,
      },
      {
        title: "GBP/JPY Sell Signal",
        content: "Bearish reversal pattern confirmed on GBP/JPY. Entry at 165.50, Stop Loss at 166.00, Take Profit at 164.50. Watch for break below support.",
        tradeAction: "Sell",
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        createdBy: admin.id,
        isActive: true,
      },
      {
        title: "USD/CHF Hold Position",
        content: "Sideways consolidation on USD/CHF. Wait for clear breakout above 0.9200 or below 0.9100 before entering new positions.",
        tradeAction: "Hold",
        imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        createdBy: admin.id,
        isActive: true,
      }
    ];

    signals.forEach(signalData => {
      const signal: ForexSignal = {
        ...signalData,
        id: this.currentSignalId++,
        imageUrls: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.forexSignals.set(signal.id, signal);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => !user.isAdmin);
  }

  async getAllUsersWithSubscriptions(): Promise<any[]> {
    const allUsers = Array.from(this.users.values()).filter(user => !user.isAdmin);
    return allUsers.map(user => {
      const subscription = Array.from(this.subscriptions.values())
        .find(sub => sub.userId === user.id);
      
      let subscriptionData = null;
      if (subscription) {
        const plan = this.subscriptionPlans.get(subscription.planId);
        subscriptionData = {
          id: subscription.id,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          plan: plan ? { id: plan.id, name: plan.name, price: plan.price } : null
        };
      }
      
      return {
        ...user,
        subscription: subscriptionData
      };
    });
  }

  // Subscription Plans
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async getPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentPlanId++;
    const plan: SubscriptionPlan = { 
      ...insertPlan, 
      id, 
      description: insertPlan.description || null,
      createdAt: new Date(),
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  // Subscriptions
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .find(sub => sub.userId === userId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      status: insertSubscription.status || "trial",
      startDate: insertSubscription.startDate || new Date(),
      createdAt: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    subscription.status = status;
    return subscription;
  }

  async updateUserSubscriptionStatus(userId: number, status: string): Promise<Subscription | undefined> {
    let subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.userId === userId);
    
    // If no subscription exists, create one (for trial creation)
    if (!subscription && status === "trial") {
      const trialId = this.currentSubscriptionId++;
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // Always 7-day trial
      
      subscription = {
        id: trialId,
        userId,
        planId: 1, // Default to Basic Plan
        status: "trial",
        startDate: new Date(),
        endDate: trialEndDate
      };
      
      this.subscriptions.set(trialId, subscription);
      console.log('✅ Created new 7-day trial subscription in memory storage:', subscription);
      return subscription;
    }
    
    if (!subscription) return undefined;

    subscription.status = status;
    
    // ALWAYS create proper 7-day trial when status is set to "trial"
    if (status === "trial") {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // Always 7-day trial
      subscription.startDate = new Date();
      subscription.endDate = trialEndDate;
      subscription.planId = 1; // Reset to Basic Plan for trials
      console.log('✅ Updated to 7-day trial subscription in memory storage:', subscription);
    }
    
    return subscription;
  }

  async updateUserSubscriptionWithPlan(userId: number, status: string, planId?: number): Promise<Subscription | undefined> {
    const subscription = Array.from(this.subscriptions.values())
      .find(sub => sub.userId === userId);
    if (!subscription) return undefined;

    subscription.status = status;
    
    // PREVENT ADMIN FROM CREATING EXPIRED TRIALS - Always create proper 7-day trials
    if (status === "trial") {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // FORCE 7-day trial
      subscription.startDate = new Date();
      subscription.endDate = trialEndDate;
      subscription.planId = 1; // Reset to Basic Plan for trials
      console.log('✅ ADMIN WITH PLAN: Created proper 7-day trial:', subscription);
    } else if (planId && status === "active") {
      const plan = await this.getPlan(planId);
      if (plan) {
        subscription.planId = planId;
        // Reset the subscription duration based on the new plan
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + plan.duration);
        subscription.endDate = newEndDate;
        subscription.startDate = new Date();
        console.log('✅ ADMIN WITH PLAN: Created active subscription:', subscription);
      }
    }
    
    return subscription;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async extendUserSubscription(userId: number, planId: number, additionalDays: number): Promise<Subscription | undefined> {
    const existingSubscription = Array.from(this.subscriptions.values())
      .find(sub => sub.userId === userId && (sub.status === "active" || sub.status === "trial"));
    
    if (existingSubscription) {
      // Extend the existing subscription
      const currentEndDate = existingSubscription.endDate > new Date() 
        ? existingSubscription.endDate 
        : new Date(); // If expired, start from now
      
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + additionalDays);
      
      existingSubscription.endDate = newEndDate;
      existingSubscription.planId = planId;
      existingSubscription.status = "active"; // Upgrade trial to active
      
      return existingSubscription;
    }
    
    return undefined;
  }

  // Forex Signals
  async getAllSignals(): Promise<ForexSignal[]> {
    return Array.from(this.forexSignals.values())
      .filter(signal => signal.isActive)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getSignal(id: number): Promise<ForexSignal | undefined> {
    return this.forexSignals.get(id);
  }

  async createSignal(insertSignal: InsertForexSignal): Promise<ForexSignal> {
    const id = this.currentSignalId++;
    const signal: ForexSignal = { 
      ...insertSignal, 
      id, 
      imageUrl: insertSignal.imageUrl || null,
      imageUrls: insertSignal.imageUrls || null,
      isActive: insertSignal.isActive || true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forexSignals.set(id, signal);
    return signal;
  }

  async updateSignal(id: number, updates: Partial<InsertForexSignal>): Promise<ForexSignal | undefined> {
    const signal = this.forexSignals.get(id);
    if (!signal) return undefined;

    Object.assign(signal, updates, { updatedAt: new Date() });
    return signal;
  }

  async deleteSignal(id: number): Promise<boolean> {
    const signal = this.forexSignals.get(id);
    if (!signal) return false;

    signal.isActive = false;
    signal.updatedAt = new Date();
    return true;
  }

  async createFreshTrial(userId: number): Promise<Subscription | undefined> {
    console.log('🎯 STORAGE: Creating fresh 7-day trial for user:', userId);
    
    // Create start and end dates for the trial
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7); // Exactly 7 days from now
    
    // Remove any existing subscription for this user
    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.userId === userId) {
        this.subscriptions.delete(id);
        console.log('🗑️ STORAGE: Removed existing subscription:', id);
      }
    }
    
    // Create fresh trial subscription
    const newSubscription: Subscription = {
      id: this.currentSubscriptionId++,
      userId: userId,
      planId: 1, // Basic plan for trials
      status: 'trial',
      startDate: now,
      endDate: endDate,
      createdAt: now
    };
    
    this.subscriptions.set(newSubscription.id, newSubscription);
    console.log('✅ STORAGE: Fresh trial created:', {
      ...newSubscription,
      durationDays: Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    return newSubscription;
  }
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).where(eq(users.isAdmin, false));
    return allUsers;
  }

  async getAllUsersWithSubscriptions(): Promise<any[]> {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
      subscription: {
        id: subscriptions.id,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          price: subscriptionPlans.price,
          duration: subscriptionPlans.duration
        }
      }
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(users.isAdmin, false));
    
    return allUsers;
  }

  // Subscription Plans
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }

  async getPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async createPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values(insertPlan).returning();
    return plan;
  }

  // Subscriptions
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  async updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined> {
    const [subscription] = await db.update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription || undefined;
  }

  async updateUserSubscriptionStatus(userId: number, status: string): Promise<Subscription | undefined> {
    // If setting to trial, create a proper 7-day trial with future end date
    if (status === "trial") {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
      
      const [subscription] = await db.update(subscriptions)
        .set({ 
          status, 
          startDate: new Date(),
          endDate: trialEndDate
        })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return subscription || undefined;
    }
    
    // For other statuses, just update the status
    const [subscription] = await db.update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return subscription || undefined;
  }

  async updateUserSubscriptionWithPlan(userId: number, status: string, planId?: number): Promise<Subscription | undefined> {
    if (planId && status === "active") {
      const plan = await this.getPlan(planId);
      if (plan) {
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + plan.duration);
        
        const [subscription] = await db.update(subscriptions)
          .set({ 
            status, 
            planId,
            startDate: new Date(),
            endDate: newEndDate
          })
          .where(eq(subscriptions.userId, userId))
          .returning();
        return subscription || undefined;
      }
    }
    
    const [subscription] = await db.update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return subscription || undefined;
  }

  async extendUserSubscription(userId: number, planId: number, additionalDays: number): Promise<Subscription | undefined> {
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription) {
      const currentEndDate = existingSubscription.endDate > new Date() 
        ? existingSubscription.endDate 
        : new Date();
      
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + additionalDays);
      
      const [subscription] = await db.update(subscriptions)
        .set({ 
          endDate: newEndDate,
          planId: planId,
          status: "active"
        })
        .where(eq(subscriptions.userId, userId))
        .returning();
      return subscription || undefined;
    }
    return undefined;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  // Forex Signals
  async getAllSignals(): Promise<ForexSignal[]> {
    return await db.select().from(forexSignals)
      .where(eq(forexSignals.isActive, true));
  }

  async getSignal(id: number): Promise<ForexSignal | undefined> {
    const [signal] = await db.select().from(forexSignals).where(eq(forexSignals.id, id));
    return signal || undefined;
  }

  async createSignal(insertSignal: InsertForexSignal): Promise<ForexSignal> {
    const [signal] = await db.insert(forexSignals).values(insertSignal).returning();
    return signal;
  }

  async updateSignal(id: number, updates: Partial<InsertForexSignal>): Promise<ForexSignal | undefined> {
    const [signal] = await db.update(forexSignals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forexSignals.id, id))
      .returning();
    return signal || undefined;
  }

  async deleteSignal(id: number): Promise<boolean> {
    const [signal] = await db.update(forexSignals)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(forexSignals.id, id))
      .returning();
    return !!signal;
  }

  async createFreshTrial(userId: number): Promise<Subscription | undefined> {
    console.log('🎯 DATABASE STORAGE: Creating fresh 7-day trial for user:', userId);
    
    // Create start and end dates for the trial
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7); // Exactly 7 days from now
    
    try {
      // Remove any existing subscription for this user first
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
      console.log('🗑️ DATABASE STORAGE: Removed existing subscription for user:', userId);
      
      // Create fresh trial subscription
      const [newSubscription] = await db.insert(subscriptions).values({
        userId: userId,
        planId: 1, // Basic plan for trials
        status: 'trial',
        startDate: now,
        endDate: endDate,
        createdAt: now
      }).returning();
      
      console.log('✅ DATABASE STORAGE: Fresh trial created:', {
        ...newSubscription,
        durationDays: Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      });
      
      return newSubscription;
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Error creating fresh trial:', error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();