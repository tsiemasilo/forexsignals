import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

let sql;
try {
  sql = neon(databaseUrl);
} catch (error) {
  console.error('Database connection error:', error);
}

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const path = event.path;

    if (path === '/api/user/subscription-status') {
      // For now, return a basic subscription status
      // In full implementation, you would get userId from session
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'active',
          statusDisplay: 'Active',
          daysLeft: 7,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          plan: {
            name: 'Trial',
            price: '0.00'
          },
          color: 'bg-blue-100 text-blue-800'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error) {
    console.error('User error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};