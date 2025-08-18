// Advanced debugging endpoint for admin issues
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🔍 [${requestId}] DEBUG ENDPOINT CALLED:`, {
      method: event.httpMethod,
      path: event.path,
      timestamp: new Date().toISOString()
    });

    // Get system status and recent activity
    const debugInfo = {
      timestamp: new Date().toISOString(),
      requestId,
      database: {
        connected: true,
        url: DATABASE_URL.replace(/:[^:@]*@/, ':***@')
      },
      tables: {},
      recentActivity: {}
    };

    // Check table status
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      const subscriptionCount = await sql`SELECT COUNT(*) as count FROM subscriptions`;
      const planCount = await sql`SELECT COUNT(*) as count FROM subscription_plans`;

      debugInfo.tables = {
        users: userCount[0].count,
        subscriptions: subscriptionCount[0].count,
        subscription_plans: planCount[0].count
      };

      // Get recent subscriptions
      const recentSubs = await sql`
        SELECT s.*, u.email, sp.name as plan_name
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.created_at > NOW() - INTERVAL '1 hour'
        ORDER BY s.created_at DESC
        LIMIT 5
      `;

      debugInfo.recentActivity = {
        subscriptionsLastHour: recentSubs.length,
        details: recentSubs
      };

      // Get status distribution
      const statusDistribution = await sql`
        SELECT status, COUNT(*) as count
        FROM subscriptions
        GROUP BY status
        ORDER BY count DESC
      `;

      debugInfo.statusDistribution = statusDistribution;

    } catch (dbError) {
      debugInfo.database.error = dbError.message;
      debugInfo.database.connected = false;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(debugInfo, null, 2)
    };

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};