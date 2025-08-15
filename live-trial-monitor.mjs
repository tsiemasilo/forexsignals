#!/usr/bin/env node

// Simple live trial monitor 
import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function checkTrialStatus() {
    try {
        const cookies = fs.readFileSync('test_cookies.txt', 'utf8').replace(/[\r\n]/g, '');
        
        // Check subscription status
        const statusResponse = await fetch(`${BASE_URL}/api/user/subscription-status`, {
            headers: { 'Cookie': cookies }
        });
        
        if (statusResponse.ok) {
            const status = await statusResponse.json();
            console.log(`[${new Date().toLocaleTimeString()}] Status: ${status.status} | Days: ${status.daysLeft} | End: ${status.endDate}`);
            
            // Test access
            const accessResponse = await fetch(`${BASE_URL}/api/signals`, {
                headers: { 'Cookie': cookies }
            });
            
            console.log(`[${new Date().toLocaleTimeString()}] Access: ${accessResponse.ok ? '✅ GRANTED' : '❌ DENIED'}`);
            
            if (!accessResponse.ok && status.status === 'trial') {
                console.log('🚨 TRIAL CORRUPTION DETECTED - Trial status but no access!');
            }
        }
    } catch (error) {
        console.log(`[${new Date().toLocaleTimeString()}] Error: ${error.message}`);
    }
}

// Monitor every 3 seconds
setInterval(checkTrialStatus, 3000);
checkTrialStatus();

console.log('🔍 Live trial monitor started - Press Ctrl+C to stop');