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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.split('/api/')[1];
    
    if (path === 'login' && event.httpMethod === 'POST') {
      console.log('=== NETLIFY LOGIN REQUEST ===');
      console.log('Event body:', event.body);
      
      const { email } = JSON.parse(event.body || '{}');
      
      console.log('Email from request:', email);
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Email is required' })
        };
      }

      // Find user (using snake_case fields to match database)
      let user = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
      
      console.log('User query result:', user);
      
      if (user.length === 0) {
        console.log(`❌ User not found: ${email}`);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'User not found. Please register first.',
            needsRegistration: true 
          })
        };
      }

      const foundUser = user[0];
      console.log('=== NETLIFY LOGIN SUCCESS ===');
      console.log(`✅ User logged in: ${foundUser.email} (ID: ${foundUser.id})`);
      console.log('User data being returned:', {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.first_name,
        lastName: foundUser.last_name,
        isAdmin: foundUser.is_admin
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          user: {
            id: foundUser.id,
            email: foundUser.email,
            firstName: foundUser.first_name,
            lastName: foundUser.last_name,
            isAdmin: foundUser.is_admin
          }
        })
      };
    }

    if (path === 'logout' && event.httpMethod === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Logout successful' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};