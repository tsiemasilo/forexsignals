import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Extract JWT token from Authorization header
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Authentication required' })
      };
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    let decoded;
    try {
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'watchlistfx-default-secret-2025';
      decoded = jwt.default.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }

    const userId = decoded.userId;

    // Get user's current subscription
    const subscriptionResult = await sql`
      SELECT s.*, sp.name as plan_name, sp.price, sp.duration_days
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    if (subscriptionResult.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'none',
          statusDisplay: 'No Subscription',
          daysLeft: 0,
          plan: null,
          color: 'bg-gray-100 text-gray-800'
        })
      };
    }

    const subscription = subscriptionResult[0];
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    
    let status, statusDisplay, color;
    
    if (subscription.status === 'active' && endDate > now) {
      status = 'active';
      statusDisplay = 'Active';
      color = 'bg-green-100 text-green-800';
    } else if (subscription.status === 'trial' && endDate > now) {
      status = 'trial';
      statusDisplay = `Trial (${daysLeft} days left)`;
      color = 'bg-blue-100 text-blue-800';
    } else {
      status = 'expired';
      statusDisplay = 'Expired';
      color = 'bg-red-100 text-red-800';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status,
        statusDisplay,
        daysLeft,
        endDate: subscription.end_date,
        plan: {
          name: subscription.plan_name,
          price: subscription.price
        },
        color
      })
    };

  } catch (error) {
    console.error('Subscription status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};