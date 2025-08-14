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

      // Store session in database
      const sessionQuery = `
        INSERT INTO sessions (session_id, user_id, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id) DO UPDATE SET
          user_id = $2,
          expires_at = $3
      `;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await pool.query(sessionQuery, [sessionId, userInfo.id, expiresAt]);

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${7 * 24 * 60 * 60}`
        },
        body: JSON.stringify({
          message: 'Emergency login successful',
          sessionId: sessionId,
          user: userInfo
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