import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection for Netlify compatibility - FIXED VERSION
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

// Helper function to get user from session
const getUserFromSession = async (event) => {
  const cookies = event.headers.cookie || '';
  const sessionMatch = cookies.match(/sessionId=([^;]+)/);
  
  if (!sessionMatch) {
    return null;
  }

  const sessionId = sessionMatch[1];
  
  const result = await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.is_admin, s.expire
    FROM sessions s
    JOIN users u ON (s.sess->>'user')::jsonb->>'id' = u.id::text
    WHERE s.sid = ${sessionId} AND s.expire > NOW()
  `;
  
  return result[0] || null;
};

// Admin Users API function - FIXED VERSION
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
    // Get user from session and verify admin access
    const user = await getUserFromSession(event);
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Session expired. Please sign in again.' })
      };
    }

    if (!user.is_admin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Admin access required' })
      };
    }

    // Get users with subscription data from database using HTTP connection
    const result = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, u.updated_at, u.is_admin,
             s.id as subscription_id, s.user_id, s.plan_id, s.status, 
             s.start_date, s.end_date, s.created_at as sub_created_at,
             p.id as plan_plan_id, p.name as plan_name, p.price as plan_price, p.duration as plan_duration
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id  
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY u.id
    `;

    // Transform the data into the expected format
    const usersData = result.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      isAdmin: row.is_admin,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subscription: row.subscription_id ? {
        id: row.subscription_id,
        userId: row.user_id,
        planId: row.plan_id,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.sub_created_at,
        updatedAt: row.updated_at,
        plan: row.plan_plan_id ? {
          id: row.plan_plan_id,
          name: row.plan_name,
          price: row.plan_price,
          duration: row.plan_duration
        } : null
      } : null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(usersData)
    };
  } catch (error) {
    console.error('Admin Users API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};