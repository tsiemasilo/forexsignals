#!/usr/bin/env node

// Test Session Debug Tool
// This helps debug why browser sessions aren't working while API tests do

import fetch from 'node-fetch';

async function testSessionDebug() {
  try {
    console.log('🔍 TESTING SESSION DEBUG SCENARIOS');
    console.log('='.repeat(50));
    
    // Test 1: Fresh login
    console.log('\n1️⃣ Testing Fresh Login...');
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'almeerahlosper@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    // Extract cookies from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    // Test 2: Check subscription status with fresh session
    console.log('\n2️⃣ Testing Subscription Status...');
    const subResponse = await fetch('http://localhost:5000/api/user/subscription-status', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader || ''
      }
    });
    
    const subData = await subResponse.json();
    console.log('Subscription status:', subData);
    
    // Test 3: Try accessing signals
    console.log('\n3️⃣ Testing Signals Access...');
    const signalsResponse = await fetch('http://localhost:5000/api/signals', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader || ''
      }
    });
    
    if (signalsResponse.ok) {
      const signalsData = await signalsResponse.json();
      console.log('✅ Signals access successful - Count:', signalsData.length);
    } else {
      const errorData = await signalsResponse.json();
      console.log('❌ Signals access failed:', signalsResponse.status, errorData);
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('If this test passes but browser fails, the issue is with browser session management');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSessionDebug().then(() => {
  console.log('\n✅ Session debug test completed');
}).catch(console.error);