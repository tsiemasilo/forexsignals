import { neon } from '@neondatabase/serverless';

// Test trial user access logic
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function testTrialAccess() {
  console.log('🧪 Testing Trial User Access Logic...\n');
  
  try {
    // Check Almeerah's current subscription
    const userCheck = await sql`
      SELECT u.id, u.email, u.first_name, 
             s.status, s.start_date, s.end_date, s.plan_id,
             p.name as plan_name, p.duration
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans p ON s.plan_id = p.id  
      WHERE u.email = 'almeerahlosper@gmail.com'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    const user = userCheck[0];
    console.log('👤 User Details:', user);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Check current trial logic
    if (user.status === 'trial') {
      const endDate = new Date(user.end_date);
      const currentDate = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('\n📊 Trial Status Analysis:');
      console.log('Status:', user.status);
      console.log('Start Date:', user.start_date);
      console.log('End Date:', user.end_date);
      console.log('Current Date:', currentDate.toISOString());
      console.log('Days Left:', daysLeft);
      console.log('Has Expired:', currentDate > endDate);
      
      console.log('\n🔍 Access Decision:');
      if (currentDate > endDate || daysLeft <= 0) {
        console.log('❌ SHOULD SHOW UPGRADE PROMPT - Trial expired');
      } else {
        console.log('✅ SHOULD SHOW SIGNALS - Trial still active');
      }
    } else {
      console.log('\n📊 Non-Trial Status:', user.status);
      if (user.status === 'inactive' || user.status === 'expired') {
        console.log('❌ SHOULD SHOW UPGRADE PROMPT - Inactive/expired');
      } else if (user.status === 'active') {
        console.log('✅ SHOULD SHOW SIGNALS - Active subscription');
      }
    }
    
    // Test creating a fresh 7-day trial
    console.log('\n🆕 Creating Fresh 7-Day Trial...');
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await sql`
      UPDATE subscriptions 
      SET status = 'trial',
          start_date = ${startDate.toISOString()},
          end_date = ${endDate.toISOString()},
          plan_id = 1
      WHERE user_id = ${user.id}
    `;
    
    console.log('✅ Trial subscription updated');
    console.log('Start:', startDate.toISOString());
    console.log('End:', endDate.toISOString());
    console.log('Days:', 7);
    
    // Verify the update
    const updatedCheck = await sql`
      SELECT status, start_date, end_date, plan_id
      FROM subscriptions 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    console.log('\n✅ Updated Subscription:', updatedCheck[0]);
    console.log('\n🎯 Expected Behavior:');
    console.log('1. User should see signals for 7 days');
    console.log('2. No upgrade prompt during trial period');
    console.log('3. Upgrade prompt only after trial expires');
    
  } catch (error) {
    console.error('❌ Error testing trial access:', error);
  }
}

testTrialAccess();