#!/usr/bin/env node

/**
 * Test the admin trial fix - reproduces the exact issue and verifies fix
 */

import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const BASE_URL = 'http://localhost:5000';

console.log('🧪 TESTING ADMIN TRIAL FIX');
console.log('=' * 50);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginAdmin() {
  console.log('\n1️⃣ Logging in as admin...');
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@forexsignals.com',
      password: 'admin123'
    })
  });

  if (!response.ok) {
    throw new Error(`Admin login failed: ${response.status} ${await response.text()}`);
  }

  const cookies = response.headers.get('set-cookie');
  console.log('✅ Admin logged in successfully');
  return cookies;
}

async function loginUser() {
  console.log('\n2️⃣ Logging in as test user...');
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'almeerahlosper@gmail.com',
      password: 'password123'
    })
  });

  if (!response.ok) {
    throw new Error(`User login failed: ${response.status} ${await response.text()}`);
  }

  const cookies = response.headers.get('set-cookie');
  console.log('✅ User logged in successfully');
  return cookies;
}

async function setTrialViaAdmin(adminCookies, userId) {
  console.log('\n3️⃣ Admin selecting "Free Trial" from dropdown...');
  console.log(`📊 Setting trial for user ${userId} via admin panel`);
  
  const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/subscription`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': adminCookies
    },
    body: JSON.stringify({
      status: 'trial',
      planId: 2  // This is exactly what happens in admin dropdown
    })
  });

  const result = await response.json();
  console.log('📋 Admin trial update result:', JSON.stringify(result, null, 2));
  
  if (!response.ok) {
    throw new Error(`Admin trial update failed: ${response.status} ${JSON.stringify(result)}`);
  }

  return result;
}

async function checkUserSubscription(userCookies) {
  console.log('\n4️⃣ Checking user subscription status...');
  
  const response = await fetch(`${BASE_URL}/api/user/subscription-status`, {
    headers: { 'Cookie': userCookies }
  });

  const result = await response.json();
  console.log('📊 User subscription status:', JSON.stringify(result, null, 2));
  
  return result;
}

async function checkSignalsAccess(userCookies) {
  console.log('\n5️⃣ Testing signals access...');
  
  const response = await fetch(`${BASE_URL}/api/signals`, {
    headers: { 'Cookie': userCookies }
  });

  if (response.ok) {
    const signals = await response.json();
    console.log(`✅ SIGNALS ACCESS WORKING: ${signals.length} signals available`);
    return { success: true, count: signals.length };
  } else {
    const error = await response.text();
    console.log(`❌ SIGNALS ACCESS FAILED: ${response.status} ${error}`);
    return { success: false, status: response.status, error };
  }
}

async function runTest() {
  try {
    const adminCookies = await loginAdmin();
    const userCookies = await loginUser();
    
    // Get initial subscription state
    const initialStatus = await checkUserSubscription(userCookies);
    console.log('📊 Initial subscription state:', initialStatus);
    
    // Admin sets trial (this is what causes corruption)
    const trialResult = await setTrialViaAdmin(adminCookies, 3);
    
    // Wait a moment for changes to propagate
    await sleep(1000);
    
    // Check subscription after admin change
    const postTrialStatus = await checkUserSubscription(userCookies);
    
    // Test signals access
    const signalsAccess = await checkSignalsAccess(userCookies);
    
    console.log('\n🎯 TEST RESULTS SUMMARY:');
    console.log('=' * 50);
    
    const daysLeft = postTrialStatus.daysLeft || 0;
    const hasAccess = signalsAccess.success;
    
    console.log(`📅 Trial Duration: ${daysLeft} days`);
    console.log(`🔐 Signals Access: ${hasAccess ? 'WORKING' : 'BLOCKED'}`);
    console.log(`📊 Status: ${postTrialStatus.statusDisplay}`);
    
    if (daysLeft >= 7 && hasAccess) {
      console.log('✅ TEST PASSED: Admin trial fix is working correctly!');
      console.log('✅ Trial has proper 7-day duration');
      console.log('✅ Signals are accessible');
    } else {
      console.log('❌ TEST FAILED: Admin trial fix is not working');
      if (daysLeft < 7) {
        console.log(`❌ Trial duration corrupted: ${daysLeft} days instead of 7`);
      }
      if (!hasAccess) {
        console.log('❌ Signals access blocked despite trial');
      }
    }
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
  }
}

runTest();