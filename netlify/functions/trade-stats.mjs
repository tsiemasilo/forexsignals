import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

// Helper function to get user from session cookie
const getUserFromSession = async (event) => {
  const cookies = event.headers.cookie || '';
  const sessionMatch = cookies.match(/sessionId=([^;]+)/);
  
  if (!sessionMatch) {
    return null;
  }
  
  const userId = parseInt(sessionMatch[1]);
  if (isNaN(userId)) {
    return null;
  }
  
  const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
  return users[0] || null;
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // GET trade statistics
    if (event.httpMethod === 'GET') {
      const user = await getUserFromSession(event);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: "Authentication required" })
        };
      }

      console.log('🔍 TRADE STATS DEBUG - User:', user.id);
      console.log('📋 User found: Yes, IsAdmin:', user.is_admin);

      if (!user.is_admin) {
        // Regular users need active subscription
        const subscriptions = await sql`
          SELECT * FROM subscriptions 
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 1
        `;

        console.log('📋 Subscription found:', subscriptions[0]);

        if (subscriptions.length === 0) {
          console.log('❌ No subscription found');
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: "Active subscription required" })
          };
        }

        const subscription = subscriptions[0];
        const now = new Date();
        const endDate = new Date(subscription.end_date);
        const validStatuses = ['active', 'trial', 'basic plan', 'premium plan', 'vip plan'];
        const isActive = validStatuses.includes(subscription.status) && endDate > now;

        console.log(`📋 Subscription status: ${subscription.status}, Active: ${isActive}`);

        if (!isActive) {
          console.log('❌ Subscription not active');
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: "Active subscription required" })
          };
        }
      }

      console.log('✅ Access granted for trade stats');

      // Get total signals count
      const totalResult = await sql`SELECT COUNT(*) as count FROM forex_signals`;
      const totalTrades = parseInt(totalResult[0]?.count || 0);

      // Get win/loss/pending counts using trade_outcome field
      let wins = 0;
      let losses = 0;
      let pending = totalTrades; // Default all to pending if column doesn't exist

      try {
        const winResult = await sql`SELECT COUNT(*) as count FROM forex_signals WHERE trade_outcome = 'win'`;
        wins = parseInt(winResult[0]?.count || 0);

        const lossResult = await sql`SELECT COUNT(*) as count FROM forex_signals WHERE trade_outcome = 'loss'`;
        losses = parseInt(lossResult[0]?.count || 0);

        const pendingResult = await sql`SELECT COUNT(*) as count FROM forex_signals WHERE trade_outcome = 'pending'`;
        pending = parseInt(pendingResult[0]?.count || 0);
      } catch (error) {
        // If trade_outcome column doesn't exist, treat all as pending
        console.log('Trade outcome column not yet available, treating all trades as pending');
      }

      // Calculate percentages
      const completedTrades = wins + losses;
      const winRate = completedTrades > 0 ? (wins / completedTrades) * 100 : 0;
      const accuracy = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

      const stats = {
        totalTrades: totalTrades,
        wins: wins,
        losses: losses,
        pending: pending,
        winRate: Math.round(winRate * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100
      };

      console.log('📊 Trade stats result:', stats);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found" })
    };

  } catch (error) {
    console.error('Trade stats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to fetch trade statistics", error: error.message })
    };
  }
};