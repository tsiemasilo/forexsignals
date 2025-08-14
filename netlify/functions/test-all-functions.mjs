import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection to test all functionality
const DATABASE_URL = 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const tests = [];
    
    // Test 1: Database connection
    try {
      const time = await sql`SELECT NOW() as current_time`;
      tests.push({ test: 'Database Connection', status: 'PASS', result: time[0].current_time });
    } catch (error) {
      tests.push({ test: 'Database Connection', status: 'FAIL', error: error.message });
    }
    
    // Test 2: User retrieval
    try {
      const users = await sql`SELECT id, email, first_name, last_name FROM users WHERE email = 'almeerahlosper@gmail.com'`;
      if (users.length > 0) {
        tests.push({ test: 'Almeerah User Lookup', status: 'PASS', result: users[0] });
      } else {
        tests.push({ test: 'Almeerah User Lookup', status: 'FAIL', error: 'User not found' });
      }
    } catch (error) {
      tests.push({ test: 'Almeerah User Lookup', status: 'FAIL', error: error.message });
    }
    
    // Test 3: Session storage
    try {
      const sessionId = `test_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const userData = { id: 3, email: 'almeerahlosper@gmail.com' };
      
      await sql`
        INSERT INTO sessions (sid, sess, expire)
        VALUES (${sessionId}, ${JSON.stringify({ user: userData })}, ${expiresAt})
        ON CONFLICT (sid) DO UPDATE SET
          sess = ${JSON.stringify({ user: userData })},
          expire = ${expiresAt}
      `;
      
      tests.push({ test: 'Session Storage', status: 'PASS', result: 'Session created successfully' });
    } catch (error) {
      tests.push({ test: 'Session Storage', status: 'FAIL', error: error.message });
    }
    
    // Test 4: Signals table
    try {
      const signals = await sql`SELECT COUNT(*) as count FROM signals WHERE is_active = true`;
      tests.push({ test: 'Signals Table', status: 'PASS', result: `${signals[0].count} active signals` });
    } catch (error) {
      tests.push({ test: 'Signals Table', status: 'FAIL', error: error.message });
    }
    
    // Test 5: Subscription table  
    try {
      const subs = await sql`SELECT COUNT(*) as count FROM subscriptions`;
      tests.push({ test: 'Subscriptions Table', status: 'PASS', result: `${subs[0].count} subscriptions` });
    } catch (error) {
      tests.push({ test: 'Subscriptions Table', status: 'FAIL', error: error.message });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'All Netlify Functions Test Results',
        timestamp: new Date().toISOString(),
        database_url: DATABASE_URL.substring(0, 50) + '...',
        tests: tests,
        summary: {
          total: tests.length,
          passed: tests.filter(t => t.status === 'PASS').length,
          failed: tests.filter(t => t.status === 'FAIL').length
        }
      })
    };

  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Test function failed',
        error: error.message 
      })
    };
  }
};