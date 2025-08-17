import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL);

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
        LEFT JOIN subscriptions s ON u.id = s."userId"
        LEFT JOIN subscription_plans sp ON s."planId" = sp.id
        WHERE u."isAdmin" = false
        ORDER BY u.id
      `;

      const groupedUsers = users.reduce((acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            isAdmin: row.isAdmin,
            subscription: null
          };
        }
        
        if (row.planId) {
          acc[row.id].subscription = {
            id: row.planId,
            status: row.status,
            startDate: row.startDate,
            endDate: row.endDate,
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
      await sql`DELETE FROM subscriptions WHERE "userId" = ${userId}`;

      // Create new subscription
      const result = await sql`
        INSERT INTO subscriptions ("userId", "planId", status, "startDate", "endDate", "createdAt")
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
      await sql`DELETE FROM subscriptions WHERE "userId" = ${userId}`;

      // Create trial subscription
      const result = await sql`
        INSERT INTO subscriptions ("userId", "planId", status, "startDate", "endDate", "createdAt")
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