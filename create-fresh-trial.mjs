import { neon } from '@neondatabase/serverless';

// Create fresh 7-day trial for Almeerah
const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function createFreshTrial() {
  console.log('🆕 Creating Fresh 7-Day Trial for Almeerah...\n');
  
  try {
    // Calculate dates for 7-day trial
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    console.log('📅 Trial Period:');
    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());
    console.log('Duration: 7 days');
    
    // Update Almeerah's subscription to fresh trial
    const result = await sql`
      UPDATE subscriptions 
      SET status = 'trial',
          start_date = ${startDate.toISOString()},
          end_date = ${endDate.toISOString()},
          plan_id = 1
      WHERE user_id = 3
      RETURNING *
    `;
    
    console.log('\n✅ Trial subscription updated:', result[0]);
    
    // Verify the trial status calculation
    const daysLeft = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log('\n🎯 Expected Trial Behavior:');
    console.log('Status: trial');
    console.log('Days Left:', daysLeft);
    console.log('Should Show Signals: YES (days > 0)');
    console.log('Should Show Upgrade: NO (until day 8)');
    
  } catch (error) {
    console.error('❌ Error creating fresh trial:', error);
  }
}

createFreshTrial();