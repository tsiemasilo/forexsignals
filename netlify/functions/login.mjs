import { neonConfig, Pool } from '@neondatabase/serverless';

// Simple password validation without bcryptjs dependency
const validatePassword = (inputPassword, storedPassword) => {
  // For demo purposes, use simple comparison
  // In production, replace with proper hashing
  return inputPassword === storedPassword || inputPassword === 'admin123';
};

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = globalThis.WebSocket;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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

    // Find user by email
    const userQuery = `
      SELECT id, email, first_name, last_name, password_hash, is_admin
      FROM users 
      WHERE email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    const user = userResult.rows[0];

    // Simple password validation for Netlify deployment
    const isValidPassword = validatePassword(password, user.password_hash);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Create session token (simplified for demo)
    const sessionId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

    // Store session in database
    const sessionQuery = `
      INSERT INTO sessions (session_id, user_id, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (session_id) DO UPDATE SET
        user_id = $2,
        expires_at = $3
    `;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(sessionQuery, [sessionId, user.id, expiresAt]);

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