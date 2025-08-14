import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb');

export const handler = async (event, context) => {
  console.log('Admin subscription function called:', event.httpMethod, event.path);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get all users with their subscription status
      const users = await sql`
        SELECT 
          u.id,
          u.email,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.is_admin as "isAdmin",
          s.status as subscription_status,
          s.plan_id,
          s.end_date,
          p.name as plan_name,
          p.price as plan_price
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans p ON s.plan_id = p.id
        ORDER BY u.id
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users)
      };
    }

    if (event.httpMethod === 'PATCH') {
      // Extract user ID from path
      const pathParts = event.path.split('/');
      const userIdIndex = pathParts.findIndex(part => part === 'users') + 1;
      const userId = pathParts[userIdIndex];
      
      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User ID not found in path' })
        };
      }
      
      const body = JSON.parse(event.body || '{}');
      const { status, planId } = body;
      console.log('Update request:', { userId, status, planId });

      // Calculate end date based on status
      let endDate = null;
      if (status === 'active') {
        const now = new Date();
        now.setDate(now.getDate() + 14); // Add 14 days for active subscription
        endDate = now.toISOString();
      }

      // Update user subscription - check if subscription exists first
      const existingSub = await sql`
        SELECT id FROM subscriptions WHERE user_id = ${userId}
      `;

      if (existingSub.length === 0) {
        // Create new subscription if none exists
        if (!planId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'planId required for new subscription' })
          };
        }
        
        await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, end_date)
          VALUES (${userId}, ${planId}, ${status}, ${endDate})
        `;
      } else {
        // Update existing subscription
        if (planId) {
          await sql`
            UPDATE subscriptions 
            SET status = ${status}, end_date = ${endDate}, plan_id = ${planId}
            WHERE user_id = ${userId}
          `;
        } else {
          await sql`
            UPDATE subscriptions 
            SET status = ${status}, end_date = ${endDate}
            WHERE user_id = ${userId}
          `;
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Subscription updated successfully',
          status,
          endDate 
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Admin subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};