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
    const path = event.path;
    const method = event.httpMethod;
    
    console.log('🔍 ADMIN REQUEST:', { path, method, headers: event.headers });

    // Simple admin check - for now, bypass authentication for testing
    // In production, add proper session validation here

    if (path === '/api/admin/users' && method === 'GET') {
      console.log('🔍 ADMIN: Fetching all users with subscriptions...');
      
      const users = await sql`
        SELECT u.*, s.*, sp.name as plan_name, sp.duration as plan_duration, sp.price as plan_price
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.is_admin = false
        ORDER BY u.id, s.created_at DESC
      `;

      console.log('🔍 ADMIN: Raw query results:', users.length, 'rows');

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
        
        // Only set subscription if this user doesn't already have one (get most recent)
        if (row.plan_id && !acc[row.id].subscription) {
          acc[row.id].subscription = {
            id: row.plan_id, // This should be subscription ID, not plan ID
            subscriptionId: row.id, // Actual subscription record ID  
            status: row.status,
            startDate: row.start_date,
            endDate: row.end_date,
            planName: row.plan_name,
            duration: row.plan_duration,
            price: row.plan_price
          };
          console.log(`🔍 ADMIN: User ${row.email} subscription:`, acc[row.id].subscription);
        }
        
        return acc;
      }, {});

      const result = Object.values(groupedUsers);
      console.log('🔍 ADMIN: Final grouped users:', result.length);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    if (path.includes('/subscription') && method === 'PUT') {
      console.log('🔧 UPDATE SUBSCRIPTION REQUEST:', { path, method, body: event.body });
      const userId = parseInt(path.split('/')[4]);
      
      if (!userId || isNaN(userId)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid user ID' })
        };
      }

      let requestData;
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
        // Set subscription to expired (yesterday's date)
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 1);
        
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
        
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, 1, 'expired', ${expiredDate.toISOString()}, ${expiredDate.toISOString()}, NOW())
          RETURNING *
        `;
        
        console.log('❌ Set subscription to expired:', result[0]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result[0])
        };
      } else if (status === 'active' && planId) {
        // Create active subscription
        const activeEndDate = new Date();
        
        // Set duration based on plan
        if (planId === 1) activeEndDate.setDate(activeEndDate.getDate() + 5);     // Basic - 5 days
        else if (planId === 2) activeEndDate.setDate(activeEndDate.getDate() + 14); // Premium - 14 days  
        else if (planId === 3) activeEndDate.setDate(activeEndDate.getDate() + 30); // VIP - 30 days
        
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
        
        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, ${planId}, 'active', NOW(), ${activeEndDate.toISOString()}, NOW())
          RETURNING *
        `;
        
        console.log('✅ Created active subscription:', result[0]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result[0])
        };
      } else {
        // Legacy handling for direct parameters
        await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

        const result = await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${userId}, ${planId || 1}, ${status}, NOW(), ${endDate || 'NOW()'}, NOW())
          RETURNING *
        `;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result[0])
        };
      }
    }

    if (path.includes('/create-trial') && method === 'POST') {
      console.log('🎯 CREATE TRIAL REQUEST:', { path, method, userId: path.split('/')[4] });
      const userId = parseInt(path.split('/')[4]);
      console.log('👤 CREATING TRIAL FOR USER ID:', userId);
      
      if (!userId || isNaN(userId)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid user ID' })
        };
      }
      
      // Create 7-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      console.log('📅 TRIAL END DATE:', endDate.toISOString());

      // Remove existing subscription
      console.log('🗑️ Removing existing subscription for user:', userId);
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      // Create trial subscription
      console.log('✅ Creating new trial subscription...');
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
        VALUES (${userId}, 1, 'trial', NOW(), ${endDate.toISOString()}, NOW())
        RETURNING *
      `;

      console.log('🎉 Trial created successfully:', result[0]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error) {
    console.error('Admin error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};