import { neon } from '@neondatabase/serverless';

// Fix admin trial setup for Almeerah
const DATABASE_URL = 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function fixAdminTrialSetup() {
  console.log('🔧 Fixing Admin Trial Setup for Almeerah...\n');
  
  try {
    // Check current subscription status
    const currentStatus = await sql`
      SELECT u.id, u.email, s.status, s.start_date, s.end_date, s.plan_id,
             EXTRACT(EPOCH FROM (s.end_date - NOW())) / 86400 as days_left
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.email = 'almeerahlosper@gmail.com'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    console.log('📊 Current Status:', currentStatus[0]);
    
    // Create proper 7-day trial with future dates
    const now = new Date();
    const startDate = new Date(now.getTime() - 1000); // 1 second ago to ensure immediate access
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    console.log('\n🆕 Setting Up New Trial:');
    console.log('Start:', startDate.toISOString());
    console.log('End:', endDate.toISOString());
    console.log('Current:', now.toISOString());
    console.log('Days:', Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Update subscription with proper trial
    const updateResult = await sql`
      UPDATE subscriptions 
      SET status = 'trial',
          start_date = ${startDate.toISOString()},
          end_date = ${endDate.toISOString()},
          plan_id = 1
      WHERE user_id = 3
      RETURNING status, start_date, end_date, plan_id
    `;
    
    console.log('\n✅ Trial Updated:', updateResult[0]);
    
    // Verify the logic matches backend
    const subscription = updateResult[0];
    const currentTime = new Date();
    const isExpired = currentTime > new Date(subscription.end_date);
    const daysLeft = Math.ceil((new Date(subscription.end_date).getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
    const shouldAllowAccess = !isExpired && (subscription.status === 'active' || subscription.status === 'trial');
    
    console.log('\n🔍 Backend Logic Check:');
    console.log('Status:', subscription.status);
    console.log('Is Expired:', isExpired);
    console.log('Days Left:', daysLeft);
    console.log('Should Allow Access:', shouldAllowAccess);
    console.log('Backend Condition:', `(status === 'active' || status === 'trial') && !expired`);
    
    if (shouldAllowAccess) {
      console.log('\n🎯 SUCCESS: Trial should now work for', daysLeft, 'days');
    } else {
      console.log('\n❌ ISSUE: Trial still not working properly');
    }
    
  } catch (error) {
    console.error('❌ Error fixing trial:', error.message);
  }
}

fixAdminTrialSetup();