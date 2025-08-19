import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    console.log('🔧 ADMIN REQUEST:', { path, method });

    // Extract user ID from path for user-specific operations
    let userId = null;
    const userIdMatch = path.match(/\/users\/(\d+)/);
    if (userIdMatch) {
      userId = parseInt(userIdMatch[1]);
    }

    // GET all users with subscriptions
    if (method === 'GET' && (path.includes('/users') || path === '/api/admin/users')) {
      const usersWithSubscriptions = await sql`
        SELECT DISTINCT ON (u.id) 
               u.id, u.email, u.first_name, u.last_name, u.is_admin, u.created_at,
               s.id as subscription_id, s.plan_id, s.status, s.start_date, s.end_date, s.created_at as sub_created,
               sp.name as plan_name, sp.duration as plan_duration, sp.price as plan_price
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.is_admin = false
        ORDER BY u.id, s.created_at DESC NULLS LAST
      `;

      const result = usersWithSubscriptions.map(row => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        isAdmin: row.is_admin,
        createdAt: row.created_at,
        subscription: row.subscription_id ? {
          id: row.subscription_id,
          planId: row.plan_id,
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          planName: row.plan_name,
          duration: row.plan_duration,
          price: row.plan_price
        } : null
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // CREATE TRIAL - POST request with create-trial in path
    if (method === 'POST' && path.includes('create-trial') && userId) {
      console.log('🎯 CREATE TRIAL REQUEST for user:', userId);
      
      // Create 7-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Remove existing subscription
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      // Create trial subscription
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
        VALUES (${userId}, 1, 'free trial', NOW(), ${endDate.toISOString()}, NOW())
        RETURNING *
      `;

      console.log('🎉 Trial created successfully:', result[0]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, subscription: result[0] })
      };
    }

    // UPDATE SUBSCRIPTION - PUT request with subscription in path
    if (method === 'PUT' && path.includes('subscription') && userId) {
      console.log('🔧 UPDATE SUBSCRIPTION REQUEST for user:', userId);
      
      const { status, planName, planId } = JSON.parse(event.body || '{}');
      console.log('🔧 Request data:', { status, planName, planId });

      // Map plan name to plan ID if planName is provided
      let finalPlanId = planId;
      if (planName && !planId) {
        const plans = await sql`SELECT id FROM subscription_plans WHERE name = ${planName}`;
        if (plans.length > 0) {
          finalPlanId = plans[0].id;
          console.log('🔧 Mapped planName to planId:', { planName, planId: finalPlanId });
        }
      }

      // Map frontend status to database status
      let dbStatus = status;
      if (status === 'active' && finalPlanId) {
        // Get plan details to determine specific status
        const plans = await sql`SELECT id, name FROM subscription_plans WHERE id = ${finalPlanId}`;
        if (plans.length > 0) {
          const planNameLower = plans[0].name.toLowerCase();
          if (planNameLower.includes('basic')) {
            dbStatus = 'basic plan';
          } else if (planNameLower.includes('premium')) {
            dbStatus = 'premium plan';
          } else if (planNameLower.includes('vip')) {
            dbStatus = 'vip plan';
          }
        }
      } else if (status === 'trial') {
        dbStatus = 'free trial';
      }

      // Remove existing subscription
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      if (status === 'expired' || status === 'inactive') {
        // Create expired subscription
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, 1, 'expired', ${new Date().toISOString()}, ${new Date().toISOString()}, NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, subscription: result[0] })
        };
      } else if (status === 'active' && finalPlanId) {
        // Get plan duration
        const plans = await sql`SELECT duration FROM subscription_plans WHERE id = ${finalPlanId}`;
        const duration = plans[0]?.duration || 5;
        
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + duration);
        
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, ${finalPlanId}, ${dbStatus}, ${now.toISOString()}, ${endDate.toISOString()}, NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, subscription: result[0] })
        };
      } else if (status === 'trial') {
        // Create 7-day trial
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 7);
        
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, 1, 'free trial', ${now.toISOString()}, ${endDate.toISOString()}, NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, subscription: result[0] })
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found", path, method })
    };

  } catch (error) {
    console.error('Admin error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};