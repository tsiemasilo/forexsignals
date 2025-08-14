import { db } from "./db";
import { users, subscriptionPlans, forexSignals } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Create forex_signals table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS forex_signals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        trade_action VARCHAR(10) NOT NULL,
        image_url VARCHAR(500),
        image_urls TEXT[],
        created_by INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Forex signals table created/verified');

    // Also create signals view for backward compatibility
    await db.execute(sql`
      CREATE OR REPLACE VIEW signals AS SELECT * FROM forex_signals;
    `);
    console.log('Signals view created for compatibility');
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@forexsignals.com")).limit(1);
    
    if (existingAdmin.length === 0) {
      // Create admin user
      const [admin] = await db.insert(users).values({
        email: "admin@forexsignals.com",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      }).returning();
      
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Ensure Almeerah is a regular customer (not admin)
    const almeerahResult = await db.update(users)
      .set({ isAdmin: false })
      .where(eq(users.email, 'almeerahlosper@gmail.com'))
      .returning();
    
    if (almeerahResult.length > 0) {
      console.log('Almeerah set as regular customer user');
    }

    // Check if subscription plans exist
    const existingPlans = await db.select().from(subscriptionPlans).limit(1);
    
    if (existingPlans.length === 0) {
      // Create subscription plans
      const plans = [
        {
          name: "Basic Plan",
          description: "One quality signal per day + market analysis",
          price: "49.99",
          duration: 5,
        },
        {
          name: "Premium Plan", 
          description: "One quality signal per day + market analysis",
          price: "99.99",
          duration: 14,
        },
        {
          name: "VIP Plan",
          description: "One quality signal per day + market analysis", 
          price: "179.99",
          duration: 30,
        }
      ];

      for (const plan of plans) {
        await db.insert(subscriptionPlans).values(plan);
      }
      
      console.log('Subscription plans created');
    } else {
      console.log('Subscription plans already exist');
    }

    // Get admin user for signals
    const [admin] = await db.select().from(users).where(eq(users.email, "admin@forexsignals.com")).limit(1);
    
    if (admin) {
      // Check if signals exist
      const existingSignals = await db.select().from(forexSignals).limit(1);
      
      if (existingSignals.length === 0) {
        // Create sample signals
        const signals = [
          {
            title: "EUR/USD Buy Signal",
            content: "Strong bullish momentum on EUR/USD. Entry at 1.0850, Stop Loss at 1.0820, Take Profit at 1.0920. Risk-reward ratio 1:2.3",
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

        for (const signal of signals) {
          await db.insert(forexSignals).values(signal);
        }
        
        console.log('Sample signals created');
      } else {
        console.log('Signals already exist');
      }
    }

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export { seedDatabase };