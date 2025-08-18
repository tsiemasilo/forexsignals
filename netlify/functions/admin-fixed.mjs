import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path || event.rawUrl || '';
    const method = event.httpMethod;
    
    console.log('🔍 ADMIN-FIXED REQUEST:', { path, method, rawUrl: event.rawUrl });
    console.log('🔍 FULL EVENT DEBUG:', {
      path: event.path,
      rawUrl: event.rawUrl,
      httpMethod: event.httpMethod,
      queryStringParameters: event.queryStringParameters,
      headers: event.headers,
      body: event.body,
      isBase64Encoded: event.isBase64Encoded
    });

    // GET all users with subscriptions
    if (method === 'GET' && (path.includes('/users') || path === '/api/admin/users')) {
      console.log('🔍 ADMIN: Fetching all users with subscriptions...');
      
      const users = await sql`
        SELECT u.*, s.*, sp.name as plan_name, sp.duration as plan_duration, sp.price as plan_price
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.is_admin = false
        ORDER BY u.id, s.created_at DESC
      `;

      const groupedUsers = users.reduce((acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            isAdmin: row.is_admin,
            createdAt: row.created_at,
            subscription: null
          };
        }
        
        if (row.plan_id && !acc[row.id].subscription) {
          acc[row.id].subscription = {
            id: row.plan_id,
            subscriptionId: row.id,
            status: row.status,
            startDate: row.start_date,
            endDate: row.end_date,
            planName: row.plan_name,
            duration: row.plan_duration,
            price: row.plan_price
          };
        }
        
        return acc;
      }, {});

      const result = Object.values(groupedUsers);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // Extract user ID from path - handle multiple patterns
    let userId = null;
    const pathSegments = path.split('/');
    console.log('🔍 PATH SEGMENTS:', pathSegments);
    
    for (let i = 0; i < pathSegments.length; i++) {
      if (pathSegments[i] === 'users' && pathSegments[i + 1]) {
        const potentialUserId = parseInt(pathSegments[i + 1]);
        if (!isNaN(potentialUserId)) {
          userId = potentialUserId;
          break;
        }
      }
    }

    console.log('🔍 EXTRACTED USER ID:', userId);

    // CREATE TRIAL - POST request with create-trial in path
    if (method === 'POST' && path.includes('create-trial') && userId) {
      console.log('🎯 CREATE TRIAL REQUEST for user:', userId);
      
      // Create 7-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      console.log('📅 TRIAL END DATE:', endDate.toISOString());

      // Remove existing subscription
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      // Create trial subscription
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
        VALUES (${userId}, 1, 'trial', NOW(), ${endDate.toISOString()}, NOW())
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
      
      let requestData = {};
      try {
        requestData = JSON.parse(event.body || '{}');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid JSON in request body' })
        };
      }

      const { planId, status, endDate } = requestData;
      console.log('📋 SUBSCRIPTION UPDATE DATA:', { userId, planId, status, endDate });

      // Handle different subscription status changes
      if (status === 'expired') {
        // Set subscription to expired
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 1);
        
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
        
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, 1, 'expired', ${expiredDate.toISOString()}, ${expiredDate.toISOString()}, NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, subscription: result[0] })
        };
      } else if (status === 'active' && planId) {
        // Create active subscription
        const activeEndDate = new Date();
        
        // Set duration based on plan
        if (planId === 1) activeEndDate.setDate(activeEndDate.getDate() + 5);
        else if (planId === 2) activeEndDate.setDate(activeEndDate.getDate() + 14);
        else if (planId === 3) activeEndDate.setDate(activeEndDate.getDate() + 30);
        
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
        
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, ${planId}, 'active', NOW(), ${activeEndDate.toISOString()}, NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, subscription: result[0] })
        };
      } else {
        // Generic status update
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, ${planId || 1}, ${status || 'trial'}, NOW(), ${endDate || 'NOW() + INTERVAL \'7 days\''}, NOW())
          RETURNING *
        `;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, subscription: result[0] })
        };
      }
    }

    console.log('❌ No route matched:', { path, method, userId });
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found', debug: { path, method, userId } })
    };

  } catch (error) {
    console.error('Admin error:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        stack: error.stack 
      })
    };
  }
};