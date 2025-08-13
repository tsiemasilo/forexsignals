import { 
  users, subscriptionPlans, subscriptions, forexSignals,
  type User, type InsertUser, type SubscriptionPlan, type InsertSubscriptionPlan,
  type Subscription, type InsertSubscription, type ForexSignal, type InsertForexSignal
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Subscription Plans
  getAllPlans(): Promise<SubscriptionPlan[]>;
  getPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Subscriptions
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionStatus(id: number, status: string): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => !user.isAdmin);
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
      createdAt: new Date(),
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  // Subscriptions
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .find(sub => sub.userId === userId && sub.status === "active");
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
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

  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
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
}

export const storage = new MemStorage();