#!/usr/bin/env node

// Sync Memory Storage with Database Trial
// This forces Replit to use the same trial as Netlify

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function syncMemoryWithDatabase() {
  try {
    console.log('🔄 SYNCING MEMORY STORAGE WITH DATABASE TRIAL');
    console.log('='.repeat(50));
    
    // Get the latest valid trial from database
    const dbTrial = await sql`
      SELECT us.*, sp.name as plan_name, sp.price as plan_price
      FROM subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = 3 AND us.status = 'trial'
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    if (dbTrial.length === 0) {
      console.log('❌ No trial found in database');
      return;
    }
    
    const trial = dbTrial[0];
    console.log('📊 Database Trial:', trial);
    
    const now = new Date();
    const endDate = new Date(trial.end_date);
    const isActive = endDate > now;
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    console.log('⏰ Trial Status:');
    console.log('  Current time:', now.toISOString());
    console.log('  End date:', endDate.toISOString());
    console.log('  Is active:', isActive);
    console.log('  Days left:', daysLeft);
    
    if (isActive) {
      console.log('✅ Database trial is active - needs to be synced to memory storage');
      
      // Force update via API to sync memory storage
      console.log('\n🔧 Making API call to sync memory storage...');
      
      const response = await fetch('http://localhost:5000/api/admin/sync-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 3,
          trialEndDate: trial.end_date,
          planId: trial.plan_id
        })
      });
      
      if (response.ok) {
        console.log('✅ Memory storage synced successfully');
      } else {
        console.log('❌ Failed to sync memory storage:', await response.text());
      }
    } else {
      console.log('❌ Database trial is expired');
    }
    
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
}

syncMemoryWithDatabase().then(() => {
  console.log('\n✅ Memory sync completed');
}).catch(console.error);