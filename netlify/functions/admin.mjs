import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    if (path === '/api/admin/users' && method === 'GET') {
      const users = await sql`
        SELECT u.*, s.*, sp.name as plan_name, sp.duration as plan_duration
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.is_admin = false
        ORDER BY u.id
      `;

      const groupedUsers = users.reduce((acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            isAdmin: row.is_admin,
            subscription: null
          };
        }
        
        if (row.plan_id) {
          acc[row.id].subscription = {
            id: row.plan_id,
            status: row.status,
            startDate: row.start_date,
            endDate: row.end_date,
            planName: row.plan_name,
            duration: row.plan_duration
          };
        }
        
        return acc;
      }, {});

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(Object.values(groupedUsers))
      };
    }

    if (path.includes('/subscription') && method === 'PUT') {
      const userId = parseInt(path.split('/')[4]);
      const { planId, status, endDate } = JSON.parse(event.body);

      // Remove existing subscription
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      // Create new subscription
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
        VALUES (${userId}, ${planId}, ${status}, NOW(), ${endDate}, NOW())
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    if (path.includes('/create-trial') && method === 'POST') {
      const userId = parseInt(path.split('/')[4]);
      
      // Create 7-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Remove existing subscription
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      // Create trial subscription
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
        VALUES (${userId}, 1, 'trial', NOW(), ${endDate.toISOString()}, NOW())
        RETURNING *
      `;

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