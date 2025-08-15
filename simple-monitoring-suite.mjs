#!/usr/bin/env node

// Simple monitoring suite without external dependencies
import { neon } from '@neondatabase/serverless';
import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL not found');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

console.log('🔍 SIMPLE MONITORING SUITE');
console.log('═'.repeat(60));

// Real-time subscription monitoring
async function monitorSubscription() {
    try {
        const subscriptions = await sql`
            SELECT s.*, p.name as plan_name
            FROM subscriptions s 
            LEFT JOIN subscription_plans p ON s."planId" = p.id 
            WHERE s."userId" = 3 
            ORDER BY s."createdAt" DESC 
            LIMIT 1
        `;

        if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            const start = new Date(sub.startDate);
            const end = new Date(sub.endDate);
            const durationMs = end.getTime() - start.getTime();
            const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));
            const durationMinutes = Math.round(durationMs / (1000 * 60));
            const isExpired = end < new Date();
            
            console.log(`[${new Date().toLocaleTimeString()}] DB: ${sub.status} | Plan: ${sub.planId} | Days: ${durationDays} | Mins: ${durationMinutes} | Expired: ${isExpired ? '❌' : '✅'}`);
            
            return { 
                status: sub.status, 
                planId: sub.planId, 
                endDate: sub.endDate, 
                durationDays, 
                durationMinutes,
                isExpired 
            };
        }
        return null;
    } catch (error) {
        console.log(`[${new Date().toLocaleTimeString()}] DB Error: ${error.message}`);
        return null;
    }
}

// Test user access
async function testUserAccess() {
    try {
        const cookies = fs.readFileSync('test_cookies.txt', 'utf8').replace(/[\r\n]/g, '');
        
        const statusResponse = await fetch(`${BASE_URL}/api/user/subscription-status`, {
            headers: { 'Cookie': cookies }
        });
        
        if (statusResponse.ok) {
            const status = await statusResponse.json();
            const signalsResponse = await fetch(`${BASE_URL}/api/signals`, {
                headers: { 'Cookie': cookies }
            });
            
            console.log(`[${new Date().toLocaleTimeString()}] API: ${status.status} | Days: ${status.daysLeft} | Access: ${signalsResponse.ok ? '✅' : '❌'}`);
            
            return { 
                status: status.status, 
                daysLeft: status.daysLeft, 
                hasAccess: signalsResponse.ok 
            };
        }
        return null;
    } catch (error) {
        console.log(`[${new Date().toLocaleTimeString()}] API Error: ${error.message}`);
        return null;
    }
}

// Combined monitoring
let lastDbState = null;
let changeCount = 0;

async function runMonitoring() {
    const dbState = await monitorSubscription();
    const apiState = await testUserAccess();
    
    // Detect changes
    if (lastDbState && dbState && (
        lastDbState.endDate !== dbState.endDate ||
        lastDbState.planId !== dbState.planId ||
        lastDbState.status !== dbState.status
    )) {
        changeCount++;
        console.log(`\n🚨 CHANGE DETECTED #${changeCount}`);
        console.log(`   BEFORE: Plan ${lastDbState.planId}, ${lastDbState.durationDays} days, ${lastDbState.isExpired ? 'expired' : 'active'}`);
        console.log(`   AFTER:  Plan ${dbState.planId}, ${dbState.durationDays} days, ${dbState.isExpired ? 'expired' : 'active'}`);
        
        if (dbState.durationDays < 1) {
            console.log('   ⚠️  WARNING: Trial duration is less than 1 day!');
        }
        if (dbState.isExpired && dbState.status === 'trial') {
            console.log('   🚫 CRITICAL: Trial status but expired date!');
        }
        console.log('');
    }
    
    lastDbState = dbState;
}

// Start monitoring every 2 seconds
console.log('📊 Starting real-time monitoring...\n');
setInterval(runMonitoring, 2000);
runMonitoring();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n📊 MONITORING SUMMARY');
    console.log(`   Changes detected: ${changeCount}`);
    console.log('   Status: Monitoring stopped');
    process.exit(0);
});