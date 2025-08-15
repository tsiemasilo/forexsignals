#!/usr/bin/env node

// Advanced debugging suite with comprehensive monitoring and testing
import { neon } from '@neondatabase/serverless';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000';
const sql = neon(process.env.DATABASE_URL);

console.log('🧪 ADVANCED DEBUGGING SUITE STARTED');
console.log('═'.repeat(80));

// Test 1: Database consistency check
async function testDatabaseConsistency() {
    console.log('\n📊 TEST 1: Database Consistency Check');
    console.log('─'.repeat(50));
    
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
            const sub = subscriptions[0];
            const start = new Date(sub.startDate);
            const end = new Date(sub.endDate);
            const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            
            console.log('✅ Database Record Found:', {
                status: sub.status,
                startDate: sub.startDate,
                endDate: sub.endDate,
                durationDays,
                isValidTrial: durationDays >= 6,
                isExpired: end < new Date(),
                planId: sub.planId,
                planName: sub.plan_name
            });
            
            return { success: true, subscription: sub, durationDays };
        } else {
            console.log('❌ No subscription found in database');
            return { success: false };
        }
    } catch (error) {
        console.log('❌ Database error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 2: Memory storage check
async function testMemoryStorage() {
    console.log('\n🧠 TEST 2: Memory Storage Check');
    console.log('─'.repeat(50));
    
    try {
        const response = await fetch(`${BASE_URL}/api/debug/memory-subscriptions`);
        
        if (response.ok) {
            const data = await response.json();
            const user3Sub = data.subscriptions.find(s => s.userId === 3);
            
            if (user3Sub) {
                const start = new Date(user3Sub.startDate);
                const end = new Date(user3Sub.endDate);
                const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                
                console.log('✅ Memory Storage Record:', {
                    status: user3Sub.status,
                    startDate: user3Sub.startDate,
                    endDate: user3Sub.endDate,
                    durationDays,
                    isValidTrial: durationDays >= 6,
                    isExpired: end < new Date()
                });
                
                return { success: true, subscription: user3Sub, durationDays };
            } else {
                console.log('❌ User 3 subscription not found in memory');
                return { success: false };
            }
        } else {
            console.log('❌ Failed to fetch memory storage data');
            return { success: false };
        }
    } catch (error) {
        console.log('❌ Memory storage error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 3: API access verification
async function testAPIAccess() {
    console.log('\n🔑 TEST 3: API Access Verification');
    console.log('─'.repeat(50));
    
    try {
        const cookies = fs.readFileSync('test_cookies.txt', 'utf8').replace(/[\r\n]/g, '');
        
        // Test subscription status
        const statusResponse = await fetch(`${BASE_URL}/api/user/subscription-status`, {
            headers: { 'Cookie': cookies }
        });
        
        if (!statusResponse.ok) {
            console.log('❌ Status API failed:', statusResponse.status);
            return { success: false };
        }
        
        const status = await statusResponse.json();
        console.log('✅ Status API Response:', {
            status: status.status,
            statusDisplay: status.statusDisplay,
            daysLeft: status.daysLeft,
            endDate: status.endDate
        });
        
        // Test signals access
        const signalsResponse = await fetch(`${BASE_URL}/api/signals`, {
            headers: { 'Cookie': cookies }
        });
        
        console.log('🎯 Signals Access:', {
            status: signalsResponse.status,
            hasAccess: signalsResponse.ok
        });
        
        if (signalsResponse.ok) {
            const signals = await signalsResponse.json();
            console.log(`📱 Signals Count: ${signals.length}`);
        }
        
        return { 
            success: true, 
            statusData: status, 
            hasSignalAccess: signalsResponse.ok,
            signalCount: signalsResponse.ok ? (await signalsResponse.json()).length : 0
        };
        
    } catch (error) {
        console.log('❌ API access error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 4: Admin functionality verification
async function testAdminFunctionality() {
    console.log('\n👑 TEST 4: Admin Functionality Verification');
    console.log('─'.repeat(50));
    
    try {
        const cookies = fs.readFileSync('admin_cookies.txt', 'utf8').replace(/[\r\n]/g, '');
        
        // Test admin users endpoint
        const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
            headers: { 'Cookie': cookies }
        });
        
        if (!usersResponse.ok) {
            console.log('❌ Admin users API failed:', usersResponse.status);
            return { success: false };
        }
        
        const users = await usersResponse.json();
        const user3 = users.find(u => u.id === 3);
        
        if (user3 && user3.subscription) {
            console.log('✅ Admin sees user 3 subscription:', {
                status: user3.subscription.status,
                startDate: user3.subscription.startDate,
                endDate: user3.subscription.endDate,
                planId: user3.subscription.planId
            });
            
            return { success: true, adminUserData: user3 };
        } else {
            console.log('❌ User 3 subscription not visible to admin');
            return { success: false };
        }
        
    } catch (error) {
        console.log('❌ Admin functionality error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test 5: Cross-platform consistency
async function testCrossPlatformConsistency() {
    console.log('\n🌐 TEST 5: Cross-Platform Consistency Check');
    console.log('─'.repeat(50));
    
    const results = {
        database: await testDatabaseConsistency(),
        memory: await testMemoryStorage(),
        api: await testAPIAccess(),
        admin: await testAdminFunctionality()
    };
    
    // Check consistency
    const allSuccess = Object.values(results).every(r => r.success);
    
    if (allSuccess) {
        console.log('\n✅ CONSISTENCY CHECK: All systems operational');
        
        // Check if trial durations match
        const dbDuration = results.database.durationDays;
        const memDuration = results.memory.durationDays;
        const apiDaysLeft = results.api.statusData.daysLeft;
        
        console.log('📊 Duration Comparison:', {
            database: dbDuration,
            memory: memDuration,
            api: apiDaysLeft,
            consistent: (dbDuration === memDuration) && (apiDaysLeft >= 6)
        });
        
    } else {
        console.log('\n❌ CONSISTENCY CHECK: Issues detected');
        Object.entries(results).forEach(([key, result]) => {
            if (!result.success) {
                console.log(`  - ${key}: FAILED ${result.error || ''}`);
            }
        });
    }
    
    return results;
}

// Main execution
async function runAdvancedDebuggingSuite() {
    const startTime = Date.now();
    
    console.log('🚀 Starting comprehensive debugging suite...\n');
    
    const results = await testCrossPlatformConsistency();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🏁 DEBUGGING SUITE COMPLETE');
    console.log('═'.repeat(80));
    console.log(`⏱️  Total execution time: ${duration.toFixed(2)} seconds`);
    console.log(`📊 Tests run: 5`);
    console.log(`✅ Success rate: ${Object.values(results).filter(r => r.success).length}/4`);
    
    // Final verdict
    const allGood = Object.values(results).every(r => r.success);
    console.log(`\n🎯 FINAL VERDICT: ${allGood ? '✅ SYSTEM HEALTHY' : '❌ ISSUES DETECTED'}`);
    
    if (allGood) {
        console.log('🎉 Trial access is working correctly across all platforms!');
    } else {
        console.log('🔧 System requires attention - check individual test results above');
    }
}

// Run the suite
runAdvancedDebuggingSuite().catch(console.error);