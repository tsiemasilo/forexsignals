import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// Use direct HTTP connection for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

// JWT secret for token signing/verification
const JWT_SECRET = process.env.JWT_SECRET || 'watchlistfx-default-secret-2025';

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    // Handle login request
    try {
      const body = JSON.parse(event.body);
      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Email and password required' })
        };
      }

      // Find user in database
      const userResult = await sql`
        SELECT id, email, first_name, last_name, is_admin
        FROM users 
        WHERE email = ${email}
      `;

      const user = userResult[0];
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      // For demo purposes, accept any password for existing users
      // In production, implement proper password hashing verification

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          isAdmin: user.is_admin
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
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
  }

  // Handle GET request - verify token and return user info
  try {
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'No token provided' })
      };
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get fresh user data from database
      const userResult = await sql`
        SELECT id, email, first_name, last_name, is_admin
        FROM users 
        WHERE id = ${decoded.userId}
      `;

      const user = userResult[0];
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'User not found' })
        };
      }

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

    } catch (jwtError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }

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