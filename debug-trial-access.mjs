#!/usr/bin/env node

// Advanced Trial Access Debugging Tool
// This script provides comprehensive debugging for trial access issues

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ No database URL found');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function debugTrialAccess() {
  console.log('🔍 ADVANCED TRIAL ACCESS DEBUGGING');
  console.log('='.repeat(50));
  
  try {
    // 1. Check user's current subscription (correct table name)
    console.log('\n📊 USER SUBSCRIPTION STATUS:');
    const userSubscriptions = await sql`
      SELECT 
        us.*,
        sp.name as plan_name,
        sp.price as plan_price,
        NOW() as current_time,
        (us.end_date > NOW()) as is_active,
        EXTRACT(EPOCH FROM (us.end_date - NOW())) / 86400 as days_remaining
      FROM subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = 3
      ORDER BY us.created_at DESC
      LIMIT 3
    `;
    
    console.table(userSubscriptions);
    
    // 2. Check what the storage.getUserSubscription returns
    console.log('\n🔍 STORAGE METHOD SIMULATION:');
    const latestSubscription = await sql`
      SELECT us.*, sp.name as plan_name, sp.price as plan_price
      FROM subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = 3
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    if (latestSubscription.length > 0) {
      const sub = latestSubscription[0];
      console.log('Latest subscription:', sub);
      
      const now = new Date();
      const endDate = new Date(sub.end_date);
      const isActive = endDate > now;
      const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      console.log('🕐 Time calculations:');
      console.log('  Current time:', now.toISOString());
      console.log('  End date:', endDate.toISOString());
      console.log('  Is active:', isActive);
      console.log('  Days left:', daysLeft);
      console.log('  Status should be:', sub.status);
      
      // 3. Test subscription access logic
      console.log('\n🎯 ACCESS CONTROL LOGIC TEST:');
      const hasActiveSubscription = sub.status === 'active' && isActive;
      const hasActiveTrial = sub.status === 'trial' && isActive;
      const shouldHaveAccess = hasActiveSubscription || hasActiveTrial;
      
      console.log('  Has active subscription:', hasActiveSubscription);
      console.log('  Has active trial:', hasActiveTrial);
      console.log('  Should have access:', shouldHaveAccess);
      
      // 4. Check what's being returned by the API
      console.log('\n📡 API RESPONSE SIMULATION:');
      const apiResponse = {
        status: sub.status,
        statusDisplay: sub.status === 'trial' ? 'Free Trial' : 
                      sub.status === 'active' ? 'Active' : 'Inactive',
        daysLeft: daysLeft,
        endDate: sub.end_date,
        plan: {
          name: sub.plan_name || 'Basic Plan',
          price: sub.plan_price || '49.99'
        },
        color: sub.status === 'trial' ? 'bg-blue-100 text-blue-800' :
               sub.status === 'active' ? 'bg-green-100 text-green-800' :
               'bg-yellow-100 text-yellow-800'
      };
      
      console.log('API Response:', JSON.stringify(apiResponse, null, 2));
      
    } else {
      console.log('❌ No subscription found for user 3');
    }
    
    // 5. Check the requireAuth middleware logic
    console.log('\n🔒 AUTH MIDDLEWARE SIMULATION:');
    console.log('This would check if user has active subscription or trial...');
    
    // 6. Analyze the signals access endpoint
    console.log('\n📊 SIGNALS ACCESS REQUIREMENTS:');
    console.log('The /api/signals endpoint requires requireAuth + subscription check');
    console.log('Let\'s trace what happens...');
    
  } catch (error) {
    console.error('❌ Debugging failed:', error);
  }
}

// Run the debugging
debugTrialAccess().then(() => {
  console.log('\n✅ Debugging completed');
}).catch(console.error);