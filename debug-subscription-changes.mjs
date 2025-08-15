#!/usr/bin/env node

// Advanced debugging script to monitor subscription changes in real-time
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 ADVANCED SUBSCRIPTION DEBUGGING STARTED');
console.log('📊 Monitoring user 3 subscription changes every 2 seconds...\n');

let lastSubscription = null;
let changeCounter = 0;

async function monitorSubscriptionChanges() {
    try {
        const subscriptions = await sql`
            SELECT s.*, p.name as plan_name, p.duration as plan_duration
            FROM subscriptions s 
            LEFT JOIN subscription_plans p ON s."planId" = p.id 
            WHERE s."userId" = 3 
            ORDER BY s."createdAt" DESC 
            LIMIT 1
        `;

        if (subscriptions.length > 0) {
            const current = subscriptions[0];
            
            // Detect changes
            if (lastSubscription && (
                lastSubscription.endDate !== current.endDate ||
                lastSubscription.status !== current.status ||
                lastSubscription.startDate !== current.startDate
            )) {
                changeCounter++;
                console.log(`\n🚨 CHANGE DETECTED #${changeCounter} at ${new Date().toISOString()}`);
                console.log('📋 BEFORE:', {
                    status: lastSubscription.status,
                    startDate: lastSubscription.startDate,
                    endDate: lastSubscription.endDate,
                    planId: lastSubscription.planId
                });
                console.log('📋 AFTER:', {
                    status: current.status,
                    startDate: current.startDate,
                    endDate: current.endDate,
                    planId: current.planId
                });
                
                // Calculate trial duration
                const start = new Date(current.startDate);
                const end = new Date(current.endDate);
                const durationMs = end.getTime() - start.getTime();
                const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));
                const durationMinutes = Math.round(durationMs / (1000 * 60));
                
                console.log('⏱️  DURATION ANALYSIS:', {
                    durationDays,
                    durationMinutes,
                    isValidTrial: durationDays >= 6, // Allow some tolerance
                    isExpiredTrial: end < new Date()
                });
                
                if (durationDays < 1) {
                    console.log('🚫 CRITICAL: Trial duration is less than 1 day!');
                }
                
                console.log('─'.repeat(80));
            }
            
            lastSubscription = current;
            
            // Status check
            const now = new Date();
            const endDate = new Date(current.endDate);
            const isActive = current.status === 'trial' && endDate > now;
            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            
            console.log(`[${new Date().toLocaleTimeString()}] User 3: ${current.status} | Days: ${daysLeft} | Active: ${isActive ? '✅' : '❌'}`);
        }
    } catch (error) {
        console.error('❌ Monitor error:', error.message);
    }
}

// Monitor every 2 seconds
setInterval(monitorSubscriptionChanges, 2000);

// Initial check
monitorSubscriptionChanges();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Monitoring stopped');
    process.exit(0);
});