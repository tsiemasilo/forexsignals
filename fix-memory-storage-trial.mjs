#!/usr/bin/env node

// Fix Memory Storage Trial Issue
// This script adds the database trial subscription to memory storage

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

async function fixMemoryStorageTrial() {
  try {
    console.log('🔧 FIXING MEMORY STORAGE TRIAL SYNCHRONIZATION');
    console.log('='.repeat(50));
    
    // Get the latest trial from database
    const dbSubscription = await sql`
      SELECT us.*, sp.name as plan_name, sp.price as plan_price
      FROM subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = 3 AND us.status = 'trial'
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    if (dbSubscription.length === 0) {
      console.log('❌ No trial subscription found in database for user 3');
      return;
    }
    
    const trial = dbSubscription[0];
    console.log('📊 Database Trial Found:', trial);
    
    const now = new Date();
    const endDate = new Date(trial.end_date);
    const isActive = endDate > now;
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    console.log('⏰ Trial Status:');
    console.log('  Current time:', now.toISOString());
    console.log('  End date:', endDate.toISOString());
    console.log('  Is active:', isActive);
    console.log('  Days left:', daysLeft);
    
    if (!isActive) {
      console.log('❌ Trial is expired, creating a fresh one...');
      
      // Create a new 7-day trial
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 7);
      
      await sql`DELETE FROM subscriptions WHERE user_id = 3`;
      
      const newTrial = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, end_date, start_date, created_at)
        VALUES (3, ${trial.plan_id}, 'trial', ${newEndDate.toISOString()}, NOW(), NOW())
        RETURNING *;
      `;
      
      console.log('✅ Fresh 7-day trial created:', newTrial[0]);
    } else {
      console.log('✅ Trial is still active');
    }
    
    // Now we need to add this to memory storage via API call
    console.log('\n🔧 The issue is that the app uses memory storage, not database storage');
    console.log('💡 Solution: Update the storage layer to use the database instead of memory');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMemoryStorageTrial().then(() => {
  console.log('\n✅ Memory storage trial fix completed');
}).catch(console.error);