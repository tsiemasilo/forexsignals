import fetch from 'node-fetch';

// Function to simulate browser login and check signals API
async function checkLiveConsole() {
  console.log('🔍 CHECKING LIVE CONSOLE FOR ALMEERAH ACCOUNT...');
  
  try {
    // First, try to check if we can access the signals API directly
    const signalsResponse = await fetch('https://watchlistfx.netlify.app/.netlify/functions/signals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 SIGNALS API TEST:');
    console.log('Status:', signalsResponse.status);
    console.log('Headers:', Object.fromEntries(signalsResponse.headers));
    
    const signalsData = await signalsResponse.text();
    console.log('Response Body:', signalsData);
    
    // Test admin login to verify authentication flow
    console.log('\n🔐 TESTING ADMIN LOGIN:');
    const adminLoginResponse = await fetch('https://watchlistfx.netlify.app/.netlify/functions/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forexsignals.com',
        password: 'admin123'
      })
    });
    
    console.log('Admin Login Status:', adminLoginResponse.status);
    const adminLoginData = await adminLoginResponse.text();
    console.log('Admin Login Response:', adminLoginData);
    
    // Test Almeerah login
    console.log('\n👤 TESTING ALMEERAH LOGIN:');
    const almeerahLoginResponse = await fetch('https://watchlistfx.netlify.app/.netlify/functions/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'almeerahlosper@gmail.com',
        password: 'password123'
      })
    });
    
    console.log('Almeerah Login Status:', almeerahLoginResponse.status);
    const almeerahLoginData = await almeerahLoginResponse.text();
    console.log('Almeerah Login Response:', almeerahLoginData);
    
    // Check if there are any Set-Cookie headers for session
    const cookies = almeerahLoginResponse.headers.get('set-cookie');
    console.log('Session Cookies:', cookies);
    
    // If login successful, test signals access with session
    if (almeerahLoginResponse.status === 200 && cookies) {
      console.log('\n📱 TESTING SIGNALS ACCESS WITH ALMEERAH SESSION:');
      const signalsWithSessionResponse = await fetch('https://watchlistfx.netlify.app/.netlify/functions/signals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        }
      });
      
      console.log('Signals Access Status:', signalsWithSessionResponse.status);
      const signalsWithSessionData = await signalsWithSessionResponse.text();
      console.log('Signals Access Response:', signalsWithSessionData);
    }
    
  } catch (error) {
    console.error('❌ Error checking live console:', error);
  }
}

checkLiveConsole();