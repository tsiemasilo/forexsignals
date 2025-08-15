#!/usr/bin/env node

// Quick tool to create fresh 7-day trials for testing

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

async function createFreshTrial() {
  try {
    // Calculate trial end date (7 days from now) - Fix the date calculation
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    console.log('🔧 Creating fresh 7-day trial for Almeerah...');
    console.log('🔍 Current time:', new Date().toISOString());
    console.log('📅 Trial will end:', trialEndDate.toISOString());
    console.log('⏰ Days difference:', Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24)));

    // Get a plan ID first (Basic Plan)
    const plan = await sql`SELECT id FROM subscription_plans WHERE name = 'Basic Plan' LIMIT 1;`;
    const planId = plan[0]?.id || 1;

    // Delete existing subscription
    await sql`DELETE FROM subscriptions WHERE user_id = 3;`;
    
    // Insert fresh trial subscription with proper 7-day future date
    const startDate = new Date();
    const result = await sql`
      INSERT INTO subscriptions (user_id, plan_id, status, end_date, start_date, created_at)
      VALUES (3, ${planId}, 'trial', ${trialEndDate.toISOString()}, ${startDate.toISOString()}, NOW())
      RETURNING *;
    `;

    console.log('✅ Fresh trial created successfully!');
    console.log('📊 Result:', result[0]);
    
    // Verify the trial
    const verification = await sql`
      SELECT 
        u.email,
        s.status,
        s.end_date,
        s.created_at,
        EXTRACT(EPOCH FROM (s.end_date - NOW())) / 86400 AS days_remaining,
        sp.name as plan_name
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE u.id = 3;
    `;
    
    console.log('\n🔍 Trial verification:');
    console.log('📧 Email:', verification[0].email);
    console.log('📈 Status:', verification[0].status);
    console.log('📅 End Date:', verification[0].end_date);
    console.log('⏰ Days Remaining:', Math.ceil(verification[0].days_remaining));
    
    console.log('\n🎯 User should now have access to signals for 7 days!');
    
  } catch (error) {
    console.error('❌ Error creating fresh trial:', error);
  }
}

createFreshTrial();