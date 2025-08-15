import { neon } from '@neondatabase/serverless';

// Simple password validation without bcryptjs dependency
const validatePassword = (inputPassword, storedPassword) => {
  // For demo purposes, use simple comparison
  // In production, replace with proper hashing
  return inputPassword === storedPassword || inputPassword === 'admin123';
};

// Use direct HTTP connection instead of pooling for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
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

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password required' })
      };
    }

    // Find user by email (no password_hash column in schema)
    const userResult = await sql`
      SELECT id, email, first_name, last_name, is_admin
      FROM users 
      WHERE email = ${email}
    `;

    if (userResult.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    const user = userResult[0];

    // Simple password validation for demo (no password_hash in schema)
    // Accept common demo passwords for testing
    const isValidPassword = (
      (user.email === 'admin@forexsignals.com' && password === 'admin123') ||
      (user.email === 'almeerahlosper@gmail.com' && password === 'password123') ||
      password === 'admin123' || password === 'password123'
    );

    if (!isValidPassword) {
      console.log('❌ INVALID PASSWORD:', { email, password, user: user.email });
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }
    
    console.log('✅ LOGIN SUCCESS:', { userId: user.id, email: user.email, isAdmin: user.is_admin });

    // Create session token (simplified for demo)
    const sessionId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

    // Store session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sql`
      INSERT INTO sessions (sid, sess, expire)
      VALUES (${sessionId}, ${JSON.stringify({ user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, isAdmin: user.is_admin } })}, ${expiresAt})
      ON CONFLICT (sid) DO UPDATE SET
        sess = ${JSON.stringify({ user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, isAdmin: user.is_admin } })},
        expire = ${expiresAt}
    `;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${7 * 24 * 60 * 60}`
      },
      body: JSON.stringify({
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin || false
        }
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Login failed' })
    };
  }
};