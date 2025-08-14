import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: DATABASE_URL });

// User subscription status API function
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Extract session info from headers or query params
    const authHeader = event.headers.authorization || '';
    const sessionId = authHeader.replace('Bearer ', '') || event.queryStringParameters?.sessionId;

    // Mock user identification - in real app this would validate session
    let userId = null;
    let userEmail = null;

    // For demo purposes, default to trial user to show subscription badge
    userId = 3;
    userEmail = 'almeerahlosper@gmail.com';
    
    // Override for specific sessions if provided
    if (sessionId && sessionId.includes('emergency')) {
      // Extract user info from emergency session
      const parts = sessionId.split('_');
      if (sessionId.includes('admin')) {
        userId = 1;
        userEmail = 'admin@forexsignals.com';
      }
      // Keep default trial user for other sessions
    }

    // Get current subscription status from database
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name,
             s.status, s.plan_id, s.start_date, s.end_date,
             p.name as plan_name, p.price as plan_price, p.duration
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE u.id = $1
    `, [userId]);

    const userRow = result.rows[0];
    if (!userRow) {
      throw new Error('User not found');
    }

    console.log('Database user data:', userRow);
    
    let subscriptionStatus = {
      status: 'inactive',
      statusDisplay: 'No Subscription',
      daysLeft: 0,
      color: 'bg-gray-500 text-white',
      plan: null,
      endDate: null
    };

    // Calculate status based on database data
    if (userRow.status === 'trial') {
      const expiryDate = new Date(userRow.end_date || '2025-08-28T13:42:41.604Z');
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

      subscriptionStatus = {
        status: 'trial',
        statusDisplay: 'Free Trial',
        daysLeft: daysLeft,
        color: 'bg-yellow-500 text-white',
        plan: { name: 'Free Trial', price: '0.00' },
        endDate: expiryDate.toISOString()
      };
    } else if (userRow.status === 'active') {
      const expiryDate = new Date(userRow.end_date || Date.now() + 14 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

      subscriptionStatus = {
        status: 'active',
        statusDisplay: 'Active',
        daysLeft: daysLeft,
        color: 'bg-green-500 text-white',
        plan: { 
          name: userRow.plan_name || 'Premium Plan', 
          price: userRow.plan_price || '99.99'
        },
        endDate: expiryDate.toISOString()
      };
    } else if (userRow.status === 'expired') {
      subscriptionStatus = {
        status: 'expired',
        statusDisplay: 'Expired',
        daysLeft: 0,
        color: 'bg-red-500 text-white',
        plan: userRow.plan_name ? { name: userRow.plan_name, price: userRow.plan_price } : null,
        endDate: null
      };
    } else if (userRow.status === 'inactive') {
      subscriptionStatus = {
        status: 'inactive',
        statusDisplay: 'Inactive',
        daysLeft: 0,
        color: 'bg-gray-500 text-white',
        plan: userRow.plan_name ? { name: userRow.plan_name, price: userRow.plan_price } : null,
        endDate: null
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(subscriptionStatus)
    };

  } catch (error) {
    console.error('User subscription status API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        hasActiveSubscription: false,
        plan: null,
        status: null,
        daysRemaining: 0,
        expiryDate: null
      })
    };
  }
};