// Create fresh trial subscription using the server's storage method
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

// Use server-side configuration
const neonConfig = { webSocketConstructor: ws };
const DATABASE_URL = 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = neon(DATABASE_URL);
const db = drizzle(pool);

async function createValidTrial() {
  console.log('🔧 Creating Valid 7-Day Trial for Almeerah...\n');
  
  try {
    // Calculate 7-day trial period
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    console.log('📅 New Trial Period:');
    console.log('Start:', startDate.toISOString());
    console.log('End:', endDate.toISOString());
    console.log('Days:', 7);
    
    // Update subscription using raw SQL (same as server)
    const updateResult = await pool`
      UPDATE subscriptions 
      SET status = 'trial',
          start_date = ${startDate.toISOString()},
          end_date = ${endDate.toISOString()},
          plan_id = 1
      WHERE user_id = 3
      RETURNING status, start_date, end_date, plan_id
    `;
    
    console.log('\n✅ Subscription Updated:', updateResult[0]);
    
    // Test the access logic (same as backend)
    const subscription = updateResult[0];
    const currentDate = new Date();
    const isExpired = currentDate > new Date(subscription.end_date);
    const daysLeft = Math.ceil((new Date(subscription.end_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('\n🔍 Access Test:');
    console.log('Status:', subscription.status);
    console.log('Expired:', isExpired);
    console.log('Days Left:', daysLeft);
    console.log('Should Allow Access:', !isExpired && (subscription.status === 'active' || subscription.status === 'trial'));
    
    if (!isExpired && subscription.status === 'trial') {
      console.log('\n✅ TRIAL SHOULD WORK: User should see signals for', daysLeft, 'days');
    } else {
      console.log('\n❌ TRIAL ISSUE: Something is still wrong');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createValidTrial();