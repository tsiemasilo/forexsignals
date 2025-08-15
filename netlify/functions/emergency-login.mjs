import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection instead of pooling for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

// Emergency login function - accepts any email for testing
export const handler = async (event, context) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod === 'GET') {
      // Handle GET requests - show simple login form or redirect
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        },
        body: `
          <!DOCTYPE html>
          <html>
            <head><title>Login</title></head>
            <body>
              <h2>Emergency Login</h2>
              <p>Use POST request to /api/login with email in body</p>
              <p>Valid emails: admin@forexsignals.com, almeerahlosper@gmail.com</p>
            </body>
          </html>
        `
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid JSON' })
      };
    }

    const { email } = body;
    
    console.log('Emergency login attempt with email:', email);

    // Accept any email that looks like an email
    if (email && email.includes('@')) {
      const sessionId = 'emergency_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Determine user based on email
      let userInfo = {
        id: 999,
        email: email,
        firstName: 'Test',
        lastName: 'User',
        isAdmin: false
      };

      if (email === 'admin@forexsignals.com') {
        userInfo = {
          id: 1,
          email: 'admin@forexsignals.com',
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        };
      } else if (email === 'tsiemasilo@gmail.com') {
        userInfo = {
          id: 2,
          email: 'tsiemasilo@gmail.com',
          firstName: 'Tsie',
          lastName: 'Masilo',
          isAdmin: false
        };
      } else if (email === 'almeerahlosper@gmail.com') {
        userInfo = {
          id: 3,
          email: 'almeerahlosper@gmail.com',
          firstName: 'Almeerah',
          lastName: 'Losper',
          isAdmin: false
        };
      }

      // Get user from database first
      const users = await sql`SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = ${email}`;
      
      if (users.length > 0) {
        const dbUser = users[0];
        userInfo = {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          isAdmin: dbUser.is_admin || dbUser.email === 'admin@forexsignals.com'
        };
      }

      // Store session in database  
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await sql`
        INSERT INTO sessions (sid, sess, expire)
        VALUES (${sessionId}, ${JSON.stringify({ user: userInfo })}, ${expiresAt})
        ON CONFLICT (sid) DO UPDATE SET
          sess = ${JSON.stringify({ user: userInfo })},
          expire = ${expiresAt}
      `;

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': `sessionId=${sessionId}; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
        },
        body: JSON.stringify({
          message: 'Emergency login successful',
          sessionId: sessionId,
          user: userInfo,
          redirectUrl: userInfo.isAdmin ? '/admin' : '/dashboard'
        })
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        message: 'Invalid email format',
        receivedEmail: email 
      })
    };

  } catch (error) {
    console.error('Emergency login error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};