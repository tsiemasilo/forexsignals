import { users, subscriptions, subscriptionPlans, forexSignals } from "@shared/schema";
import type { User, InsertUser, Subscription, InsertSubscription, SubscriptionPlan, InsertSubscriptionPlan, ForexSignal, InsertForexSignal } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllUsersWithSubscriptions(): Promise<any[]>;
  deleteUser(id: number): Promise<boolean>;
  promoteUserToAdmin(id: number): Promise<User | undefined>;

  // Subscription Plans
  getAllPlans(): Promise<SubscriptionPlan[]>;
  getPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Subscriptions
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(insertSubscription: InsertSubscription): Promise<Subscription>;
  updateUserSubscriptionStatus(userId: number, planId: number, status: string, endDate: Date): Promise<Subscription | undefined>;
  createFreshTrial(userId: number): Promise<Subscription | undefined>;
  expireUserSubscription(userId: number): Promise<void>;
  createActiveSubscription(userId: number, planName: string): Promise<Subscription | undefined>;

  // Forex Signals
  getAllSignals(): Promise<ForexSignal[]>;
  getSignal(id: number): Promise<ForexSignal | undefined>;
  createSignal(insertSignal: InsertForexSignal): Promise<ForexSignal>;
  updateSignal(id: number, updateData: Partial<ForexSignal>): Promise<ForexSignal | undefined>;
  deleteSignal(id: number): Promise<boolean>;

  // Trade Statistics
  getTradeStats(): Promise<any>;

  // Migration methods
  addPasswordColumn(): Promise<void>;
  addTradeOutcomeColumn(): Promise<void>;
  updateUserPassword(email: string, hashedPassword: string): Promise<void>;
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

  async deleteUser(id: number): Promise<boolean> {
    try {
      // First delete all user's subscriptions
      await db.delete(subscriptions).where(eq(subscriptions.userId, id));
      
      // Then delete the user
      await db.delete(users).where(eq(users.id, id));
      
      console.log(`✅ DATABASE STORAGE: Deleted user ${id} and all associated data`);
      return true;
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Error deleting user:', error);
      return false;
    }
  }

  async promoteUserToAdmin(id: number): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, id))
        .returning();
      
      console.log(`✅ DATABASE STORAGE: Promoted user ${id} to admin`);
      return updatedUser || undefined;
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Error promoting user to admin:', error);
      return undefined;
    }
  }

  async getAllUsersWithSubscriptions(): Promise<any[]> {
    const allUsers = await db
      .select()
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(users.isAdmin, false));
    

    
    // Transform the result to the expected structure
    return allUsers.map(row => ({
      id: row.users.id,
      email: row.users.email,
      firstName: row.users.firstName,
      lastName: row.users.lastName,
      isAdmin: row.users.isAdmin,
      createdAt: row.users.createdAt,
      subscription: row.subscriptions ? {
        id: row.subscriptions.id,
        status: row.subscriptions.status,
        startDate: row.subscriptions.startDate,
        endDate: row.subscriptions.endDate,
        plan: row.subscription_plans ? {
          id: row.subscription_plans.id,
          name: row.subscription_plans.name,
          price: row.subscription_plans.price,
          duration: row.subscription_plans.duration
        } : null
      } : null
    }));
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
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  async updateUserSubscriptionStatus(userId: number, planId: number, status: string, endDate: Date): Promise<Subscription | undefined> {
    try {
      // Remove any existing subscription for this user first
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
      console.log('🗑️ DATABASE STORAGE: Removed existing subscription for user:', userId);
      
      // Create new subscription
      const now = new Date();
      const [newSubscription] = await db.insert(subscriptions).values({
        userId: userId,
        planId: planId,
        status: status,
        startDate: now,
        endDate: endDate,
      }).returning();
      
      console.log('✅ DATABASE STORAGE: New subscription created:', {
        ...newSubscription,
        durationDays: Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      });
      
      return newSubscription;
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Error updating subscription:', error);
      return undefined;
    }
  }

  async createFreshTrial(userId: number): Promise<Subscription | undefined> {
    // Create start and end dates for the trial
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7); // Exactly 7 days from now
    
    try {
      // Remove any existing subscription for this user first
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
      console.log('🗑️ DATABASE STORAGE: Removed existing subscription for user:', userId);
      
      // Create fresh trial subscription (assuming plan ID 1 is basic plan)
      const [newSubscription] = await db.insert(subscriptions).values({
        userId: userId,
        planId: 1, // Basic plan for trials
        status: 'trial',
        startDate: now,
        endDate: endDate,
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

  async expireUserSubscription(userId: number): Promise<void> {
    try {
      // Set current subscription to expired (past date)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
      
      // Create expired subscription
      await db.insert(subscriptions).values({
        userId: userId,
        planId: 1, // Basic plan
        status: 'expired',
        startDate: pastDate,
        endDate: pastDate,
      });
      
      console.log('❌ DATABASE STORAGE: Set subscription to expired for user:', userId);
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Error expiring subscription:', error);
    }
  }

  async createActiveSubscription(userId: number, planName: string): Promise<Subscription | undefined> {
    try {
      // Find the plan by name
      const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, planName));
      
      if (!plan) {
        console.error('❌ Plan not found:', planName);
        return undefined;
      }
      
      // Remove any existing subscription
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
      
      // Create active subscription
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + plan.duration); // Use plan duration
      
      const [newSubscription] = await db.insert(subscriptions).values({
        userId: userId,
        planId: plan.id,
        status: 'active',
        startDate: now,
        endDate: endDate,
      }).returning();
      
      console.log('✅ DATABASE STORAGE: Created active subscription:', {
        ...newSubscription,
        planName,
        durationDays: plan.duration
      });
      
      return newSubscription;
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Error creating active subscription:', error);
      return undefined;
    }
  }

  // Forex Signals
  async getAllSignals(): Promise<ForexSignal[]> {
    const signals = await db.select().from(forexSignals)
      .orderBy(desc(forexSignals.createdAt));
    
    // imageUrls should already be parsed by Drizzle as it's a json column type
    return signals;
  }

  async getSignal(id: number): Promise<ForexSignal | undefined> {
    const [signal] = await db.select().from(forexSignals).where(eq(forexSignals.id, id));
    if (!signal) return undefined;
    
    // imageUrls should already be parsed by Drizzle as it's a json column type
    return signal;
  }

  async createSignal(insertSignal: InsertForexSignal): Promise<ForexSignal> {
    const [signal] = await db.insert(forexSignals).values(insertSignal).returning();
    return signal;
  }

  async updateSignal(id: number, updateData: Partial<ForexSignal>): Promise<ForexSignal | undefined> {
    try {
      const [updatedSignal] = await db.update(forexSignals)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(forexSignals.id, id))
        .returning();
      
      return updatedSignal || undefined;
    } catch (error) {
      console.error('Error updating signal:', error);
      throw error;
    }
  }

  async deleteSignal(id: number): Promise<boolean> {
    // Hard delete for now since isActive column doesn't exist
    const deletedRows = await db.delete(forexSignals)
      .where(eq(forexSignals.id, id));
    return true; // Assume success for now
  }

  // Trade Statistics
  async getTradeStats(): Promise<any> {
    try {
      // Get total signals count
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(forexSignals);
      const totalTrades = totalResult[0]?.count || 0;

      // Get win/loss/pending counts using tradeOutcome field
      let wins = 0;
      let losses = 0;
      let pending = totalTrades; // Default all to pending if column doesn't exist

      try {
        const winResult = await db.select({ count: sql<number>`count(*)` })
          .from(forexSignals)
          .where(eq(forexSignals.tradeOutcome, 'win'));
        wins = winResult[0]?.count || 0;

        const lossResult = await db.select({ count: sql<number>`count(*)` })
          .from(forexSignals)
          .where(eq(forexSignals.tradeOutcome, 'loss'));
        losses = lossResult[0]?.count || 0;

        const pendingResult = await db.select({ count: sql<number>`count(*)` })
          .from(forexSignals)
          .where(eq(forexSignals.tradeOutcome, 'pending'));
        pending = pendingResult[0]?.count || 0;
      } catch (error) {
        // If trade_outcome column doesn't exist, treat all as pending
        console.log('Trade outcome column not yet available, treating all trades as pending');
      }

      // Calculate percentages
      const completedTrades = wins + losses;
      const winRate = completedTrades > 0 ? (wins / completedTrades) * 100 : 0;
      const accuracy = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

      return {
        totalTrades: Number(totalTrades),
        wins: Number(wins),
        losses: Number(losses), 
        pending: Number(pending),
        winRate: Math.round(winRate * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100
      };
    } catch (error) {
      console.error('Error getting trade stats:', error);
      return {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        pending: 0,
        winRate: 0,
        accuracy: 0
      };
    }
  }

  // Migration methods
  async addPasswordColumn(): Promise<void> {
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN password VARCHAR(255)`);
      console.log('✅ Password column added successfully');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.code === '42701') {
        console.log('Password column already exists');
        return;
      }
      throw error;
    }
  }

  async addTradeOutcomeColumn(): Promise<void> {
    try {
      await db.execute(sql`ALTER TABLE forex_signals ADD COLUMN trade_outcome VARCHAR(10) DEFAULT 'pending' NOT NULL`);
      console.log('✅ Trade outcome column added successfully');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.code === '42701') {
        console.log('Trade outcome column already exists');
        return;
      }
      throw error;
    }
  }

  async updateUserPassword(email: string, hashedPassword: string): Promise<void> {
    try {
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email));
      console.log(`✅ Password updated for user: ${email}`);
    } catch (error) {
      console.error(`Failed to update password for ${email}:`, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();