import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
      const { email } = JSON.parse(event.body);
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Email is required' })
        };
      }

      // Find or create user
      let user = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
      
      if (user.length === 0) {
        // Create new user
        const [firstName, lastName] = email.split('@')[0].split(/[._]/).map(
          part => part.charAt(0).toUpperCase() + part.slice(1)
        );
        
        user = await sql`
          INSERT INTO users (email, "firstName", "lastName", "isAdmin")
          VALUES (${email}, ${firstName || 'User'}, ${lastName || ''}, false)
          RETURNING *
        `;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Login successful',
          user: {
            id: user[0].id,
            email: user[0].email,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            isAdmin: user[0].isAdmin
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