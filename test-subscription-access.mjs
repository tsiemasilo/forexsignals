import { neon } from '@neondatabase/serverless';

// Test subscription access for debugging
const DATABASE_URL = 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function testSubscriptionAccess() {
  console.log('🔍 TESTING SUBSCRIPTION ACCESS...');
  
  try {
    // Check all users and their subscriptions
    const usersResult = await sql`
      SELECT u.id, u.email, u.is_admin,
             s.status, s.start_date, s.end_date, s.created_at as sub_created
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY u.id
    `;
    
    console.log('👥 ALL USERS AND SUBSCRIPTIONS:');
    usersResult.forEach(user => {
      console.log(`User ${user.id} (${user.email}):`, {
        isAdmin: user.is_admin,
        subscriptionStatus: user.status || 'No subscription',
        endDate: user.end_date,
        isExpired: user.end_date ? new Date() > user.end_date : null
      });
    });
    
    // Test specific user ID 3 (Almeerah)
    const almeerahResult = await sql`
      SELECT u.id, u.email, u.is_admin,
             s.status, s.start_date, s.end_date
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = 3
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    console.log('🎯 ALMEERAH USER (ID 3) SUBSCRIPTION:');
    if (almeerahResult[0]) {
      const user = almeerahResult[0];
      const isExpired = user.end_date ? new Date() > user.end_date : true;
      const isActiveOrTrial = user.status === 'active' || user.status === 'trial';
      
      console.log({
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        subscriptionStatus: user.status || 'No subscription',
        endDate: user.end_date,
        currentTime: new Date().toISOString(),
        isExpired: isExpired,
        isActiveOrTrial: isActiveOrTrial,
        shouldHaveAccess: user.is_admin || (!isExpired && isActiveOrTrial)
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing subscription access:', error);
  }
}

testSubscriptionAccess();