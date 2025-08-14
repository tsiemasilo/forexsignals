import { neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = globalThis.WebSocket;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: DATABASE_URL });

// Admin user subscription management API function
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
    // Extract user ID from path
    const pathParts = event.path.split('/');
    const userIdIndex = pathParts.findIndex(part => part === 'users') + 1;
    const userId = pathParts[userIdIndex];

    console.log('Admin subscription update for user:', userId);
    console.log('Method:', event.httpMethod);
    console.log('Body:', event.body);

    if (event.httpMethod === 'PUT' || event.httpMethod === 'PATCH') {
      // Update user subscription status
      const body = JSON.parse(event.body || '{}');
      const { status, planId } = body;

      console.log('Updating subscription status to:', status);
      console.log('Plan ID:', planId);

      // Get current planId first for non-active statuses
      let finalPlanId = planId;
      if (status !== 'active') {
        const currentData = await pool.query(
          'SELECT plan_id FROM subscriptions WHERE user_id = $1',
          [parseInt(userId)]
        );
        finalPlanId = currentData.rows[0]?.plan_id || 2; // Default to Premium Plan if none exists
      }

      // Update the database using raw SQL for better compatibility
      const updateResult = await pool.query(
        `UPDATE subscriptions 
         SET status = $1, plan_id = $2
         WHERE user_id = $3`,
        [status, finalPlanId, parseInt(userId)]
      );

      console.log('Database update result:', updateResult);

      // Get updated user data using raw SQL
      const userResult = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name,
                s.status, s.plan_id, s.start_date, s.end_date,
                p.name as plan_name, p.price as plan_price
         FROM users u
         LEFT JOIN subscriptions s ON u.id = s.user_id
         LEFT JOIN subscription_plans p ON s.plan_id = p.id
         WHERE u.id = $1`,
        [parseInt(userId)]
      );

      const user = userResult.rows[0];
      console.log('Updated user data:', user);

      const statusDisplay = status === 'trial' ? 'Free Trial' :
                          status === 'active' ? 'Active' :
                          status === 'inactive' ? 'Inactive' :
                          status === 'expired' ? 'Expired' : 'Unknown';

      const responseData = {
        id: user.id,
        email: user.email,
        subscription: {
          status: status,
          statusDisplay: statusDisplay,
          plan: user.plan_name || null,
          planId: status === 'active' ? planId : null,
          expiryDate: user.end_date
        }
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseData)
      };
    }

    if (event.httpMethod === 'GET') {
      // Get user subscription info
      const user = {
        id: parseInt(userId),
        email: userId === '3' ? 'almeerahlosper@gmail.com' : 
               userId === '2' ? 'tsiemasilo@gmail.com' : 'admin@forexsignals.com',
        subscription: {
          status: userId === '3' ? 'trial' : 'inactive',
          plan: userId === '3' ? 'Free Trial' : null,
          expiryDate: userId === '3' ? '2025-08-28T13:42:41.604Z' : null
        }
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error in admin user subscription:', error);
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