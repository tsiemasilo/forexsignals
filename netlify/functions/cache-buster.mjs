import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Real-time cache invalidation endpoint
    // This forces browsers to refresh their cached data
    const timestamp = new Date().toISOString();
    
    // Get fresh user data with no caching
    const users = await sql`
      SELECT DISTINCT ON (u.id) 
             u.id, u.email, u.first_name, u.last_name, u.is_admin, u.created_at,
             s.id as subscription_id, s.plan_id, s.status, s.start_date, s.end_date,
             sp.name as plan_name, sp.duration as plan_duration, sp.price as plan_price,
             CASE 
               WHEN s.end_date IS NULL THEN 0
               WHEN s.end_date <= NOW() THEN 0
               ELSE EXTRACT(DAY FROM s.end_date - NOW())::INTEGER + 1
             END as days_remaining
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE u.is_admin = false
      ORDER BY u.id, s.created_at DESC NULLS LAST
    `;

    const result = users.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      subscription: row.subscription_id ? {
        id: row.subscription_id,
        planId: row.plan_id,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        planName: row.plan_name,
        duration: row.plan_duration,
        price: row.plan_price,
        daysRemaining: row.days_remaining
      } : null,
      lastUpdated: timestamp,
      cacheInvalidated: true
    }));

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'X-Cache-Bust-Timestamp': timestamp,
        'X-Data-Fresh': 'true'
      },
      body: JSON.stringify({
        success: true,
        timestamp,
        cacheBusted: true,
        users: result,
        meta: {
          totalUsers: result.length,
          activeSubscriptions: result.filter(u => u.subscription?.status === 'active').length,
          trialUsers: result.filter(u => u.subscription?.status === 'trial').length
        }
      })
    };

  } catch (error) {
    console.error('🚨 CACHE-BUSTER ERROR:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};