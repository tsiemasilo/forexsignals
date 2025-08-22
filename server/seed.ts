import { db } from "./db";
import { users, subscriptionPlans, forexSignals } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // First check if the table structure is compatible by attempting to query without password
    let tableHasPasswordColumn = true;
    try {
      await db.select({ id: users.id, email: users.email, password: users.password }).from(users).limit(1);
    } catch (error: any) {
      if (error.message?.includes('password') || error.code === '42703') {
        console.log('Password column not found in database - skipping user seeding until schema is updated');
        tableHasPasswordColumn = false;
      }
    }

    if (!tableHasPasswordColumn) {
      console.log('Database schema needs updating - user seeding skipped');
      // Continue with plans and signals seeding which don't require password
    } else {
      // Check if admin user already exists
      const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@forexsignals.com")).limit(1);
    
    if (existingAdmin.length === 0) {
      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const [admin] = await db.insert(users).values({
        email: "admin@forexsignals.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      }).returning();
      
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Check if Almeerah user exists, create if not
    const existingAlmeerah = await db.select().from(users).where(eq(users.email, 'almeerahlosper@gmail.com')).limit(1);
    
    if (existingAlmeerah.length === 0) {
      // Create Almeerah user with hashed password
      const hashedPassword = await bcrypt.hash("password123", 10);
      const [almeerah] = await db.insert(users).values({
        email: "almeerahlosper@gmail.com",
        password: hashedPassword,
        firstName: "Almeerah",
        lastName: "Losper",
        isAdmin: false,
      }).returning();
      
      console.log('Almeerah user created:', almeerah.email);
    } else {
      // Ensure Almeerah is a regular customer (not admin)
      await db.update(users)
        .set({ isAdmin: false })
        .where(eq(users.email, 'almeerahlosper@gmail.com'));
      console.log('Almeerah set as regular customer user');
    }
    } // End of tableHasPasswordColumn check

    // Create default subscription plans
    const existingPlans = await db.select().from(subscriptionPlans);
    
    if (existingPlans.length === 0) {
      await db.insert(subscriptionPlans).values([
        {
          name: "Basic Plan",
          price: "29.99",
          duration: 30,
          description: "Basic forex signals access",
        },
        {
          name: "Pro Plan",
          price: "79.99",
          duration: 30,
          description: "Professional forex signals access",
        },
        {
          name: "VIP Plan",
          price: "179.99",
          duration: 30,
          description: "VIP forex signals access",
        }
      ]);
      
      console.log('Subscription plans created');
    } else {
      console.log('Subscription plans already exist');
    }

    // Create sample forex signals
    const existingSignals = await db.select().from(forexSignals);
    
    if (existingSignals.length === 0) {
      // Get admin user ID for signal creation
      const [adminUser] = await db.select().from(users).where(eq(users.email, "admin@forexsignals.com"));
      
      if (adminUser) {
        await db.insert(forexSignals).values([
          {
            title: "EUR/USD Buy Signal",
            content: "Strong bullish momentum on EUR/USD. Entry at 1.0850, Stop Loss at 1.0820, Take Profit at 1.0920. Risk-reward ratio 1:2.3",
            tradeAction: "Buy",
            imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
            createdBy: adminUser.id,
          },
          {
            title: "GBP/JPY Sell Signal",
            content: "Bearish reversal pattern confirmed on GBP/JPY. Entry at 165.50, Stop Loss at 166.00, Take Profit at 164.50. Watch for break below support.",
            tradeAction: "Sell",
            imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
            createdBy: adminUser.id,
          },
          {
            title: "USD/CHF Hold Position",
            content: "Consolidation phase on USD/CHF. Current position at 0.9150. Waiting for clear direction. Monitor closely for breakout signals.",
            tradeAction: "Hold",
            imageUrl: "https://images.unsplash.com/photo-1559589689-577aabd1db4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
            createdBy: adminUser.id,
          },
          {
            title: "AUD/USD Buy Opportunity",
            content: "Australian dollar showing strength against USD. Entry at 0.6720, Stop Loss at 0.6680, Take Profit at 0.6780. Good risk-reward setup.",
            tradeAction: "Buy",
            imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
            createdBy: adminUser.id,
          }
        ]);
        
        console.log('Sample forex signals created');
      }
    } else {
      console.log('Forex signals already exist');
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}