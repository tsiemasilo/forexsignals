import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get user from session
    const cookies = event.headers.cookie || '';
    const sessionMatch = cookies.match(/sessionId=([^;]+)/);
    
    if (!sessionMatch) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'No session found' })
      };
    }

    const sessionId = sessionMatch[1];
    
    const result = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_admin, s.expire
      FROM sessions s
      JOIN users u ON (s.sess->>'user')::jsonb->>'id' = u.id::text
      WHERE s.sid = ${sessionId} AND s.expire > NOW()
    `;
    
    const user = result[0];
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Session expired' })
      };
    }

    // Return user information
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin
      })
    };

  } catch (error) {
    console.error('Auth function error:', error);
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