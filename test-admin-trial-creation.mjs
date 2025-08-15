#!/usr/bin/env node

// Advanced testing script to verify admin trial creation
import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function loadCookies() {
    try {
        const cookies = fs.readFileSync('admin_cookies.txt', 'utf8');
        return cookies.trim().replace(/[\r\n]/g, ''); // Remove any newlines
    } catch (error) {
        console.error('❌ Failed to load admin cookies');
        return null;
    }
}

async function testAdminTrialCreation() {
    console.log('🧪 ADVANCED ADMIN TRIAL TESTING');
    console.log('═'.repeat(60));
    
    const cookies = await loadCookies();
    if (!cookies) {
        console.log('❌ No admin cookies found. Please login first.');
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookies
    };

    try {
        // Step 1: Check current subscription status
        console.log('\n📊 STEP 1: Check current subscription status');
        const statusResponse = await fetch(`${BASE_URL}/api/admin/users`, { headers });
        
        if (!statusResponse.ok) {
            console.log('❌ Failed to fetch users:', statusResponse.status);
            return;
        }
        
        const users = await statusResponse.json();
        const user3 = users.find(u => u.id === 3);
        
        if (!user3) {
            console.log('❌ User 3 not found');
            return;
        }
        
        console.log('📋 Current user 3 subscription:', {
            status: user3.subscription?.status,
            startDate: user3.subscription?.startDate,
            endDate: user3.subscription?.endDate,
            planId: user3.subscription?.planId
        });

        // Step 2: Test trial creation
        console.log('\n🔧 STEP 2: Creating new trial');
        
        const trialData = {
            status: 'trial',
            planId: undefined // Should not matter for trials
        };
        
        console.log('📤 Sending trial request:', trialData);
        
        const trialResponse = await fetch(`${BASE_URL}/api/admin/users/3/subscription`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(trialData)
        });

        if (!trialResponse.ok) {
            const errorText = await trialResponse.text();
            console.log('❌ Trial creation failed:', trialResponse.status, errorText);
            return;
        }

        const trialResult = await trialResponse.json();
        console.log('📥 Trial creation response:', trialResult);

        // Step 3: Verify the created trial
        console.log('\n✅ STEP 3: Verifying created trial');
        
        const start = new Date(trialResult.subscription.startDate);
        const end = new Date(trialResult.subscription.endDate);
        const durationMs = end.getTime() - start.getTime();
        const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        
        console.log('📊 Trial Analysis:', {
            status: trialResult.subscription.status,
            startDate: trialResult.subscription.startDate,
            endDate: trialResult.subscription.endDate,
            durationDays,
            durationMinutes,
            isValidTrial: durationDays >= 6,
            isExpired: end < new Date(),
            planId: trialResult.subscription.planId
        });

        // Step 4: Test access
        console.log('\n🔑 STEP 4: Testing trial access');
        
        const testCookies = fs.readFileSync('test_cookies.txt', 'utf8').trim();
        const accessResponse = await fetch(`${BASE_URL}/api/signals`, {
            headers: { 'Cookie': testCookies }
        });
        
        console.log('🎯 Access test result:', {
            status: accessResponse.status,
            hasAccess: accessResponse.ok
        });

        if (accessResponse.ok) {
            const signals = await accessResponse.json();
            console.log(`📱 Signals accessible: ${signals.length}`);
        }

        // Final verdict
        console.log('\n🏁 FINAL VERDICT');
        console.log('═'.repeat(40));
        
        if (durationDays >= 6 && !end < new Date() && accessResponse.ok) {
            console.log('✅ TRIAL CREATION: SUCCESS');
            console.log('✅ All checks passed - trial is working correctly');
        } else {
            console.log('❌ TRIAL CREATION: FAILED');
            console.log('❌ Issues detected:');
            if (durationDays < 6) console.log('  - Duration too short');
            if (end < new Date()) console.log('  - Trial already expired');
            if (!accessResponse.ok) console.log('  - No access to signals');
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run multiple test cycles
async function runTestCycles() {
    for (let i = 1; i <= 3; i++) {
        console.log(`\n🔄 TEST CYCLE ${i}/3`);
        await testAdminTrialCreation();
        
        if (i < 3) {
            console.log('\n⏳ Waiting 5 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

runTestCycles();