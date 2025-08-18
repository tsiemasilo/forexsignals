import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('NETLIFY_DATABASE_URL or DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

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
    // Get all users
    const users = await sql`SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC`;
    
    // Search for user "ae" or similar
    const userAe = await sql`SELECT * FROM users WHERE email ILIKE '%ae%' OR first_name ILIKE '%ae%' OR last_name ILIKE '%ae%'`;
    
    // Recent users
    const recent = await sql`SELECT * FROM users WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC`;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        allUsers: users,
        userAeSearch: userAe,
        recentUsers: recent,
        totalUsers: users.length
      }, null, 2)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};