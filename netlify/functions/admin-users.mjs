import { neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for Netlify serverless - disable WebSocket for HTTP pooling
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000
});

// Admin Users API function
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get users with subscription data from database using raw SQL
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, u.updated_at,
             s.id as subscription_id, s.user_id, s.plan_id, s.status, 
             s.start_date, s.end_date, s.created_at as sub_created_at,
             p.id as plan_id, p.name as plan_name, p.price as plan_price, p.duration as plan_duration
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id  
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY u.id
    `);

    // Transform the raw data into the expected format
    const usersData = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subscription: row.subscription_id ? {
        id: row.subscription_id,
        userId: row.user_id,
        planId: row.plan_id,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.sub_created_at,
        updatedAt: row.updated_at,
        plan: row.plan_id ? {
          id: row.plan_id,
          name: row.plan_name,
          price: row.plan_price,
          duration: row.plan_duration
        } : null
      } : null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(usersData)
    };
  } catch (error) {
    console.error('Admin Users API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};