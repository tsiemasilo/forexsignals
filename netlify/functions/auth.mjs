import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie, Set-Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    // LOGIN
    if (path === '/api/login' && method === 'POST') {
      const { email } = JSON.parse(event.body || '{}');
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Email is required" })
        };
      }

      // Check if user exists
      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      
      if (users.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            message: "Account not found. Please register first to create your account.",
            needsRegistration: true 
          })
        };
      }

      const user = users[0];

      // Check if user has subscription
      const subscriptions = await sql`
        SELECT s.*, sp.name as plan_name, sp.duration, sp.price 
        FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = ${user.id}
        ORDER BY s.created_at DESC
        LIMIT 1
      `;

      let needsTrial = false;
      if (subscriptions.length === 0) {
        // Create 7-day trial for first-time login
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        
        await sql`
          INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
          VALUES (${user.id}, 1, 'free trial', NOW(), ${endDate.toISOString()}, NOW())
        `;
        
        needsTrial = true;
      }

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': `sessionId=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
        },
        body: JSON.stringify({ 
          message: "Login successful", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          },
          trialCreated: needsTrial
        })
      };
    }

    // REGISTER
    if (path === '/api/register' && method === 'POST') {
      const { email, firstName, lastName } = JSON.parse(event.body || '{}');
      
      if (!email || !firstName || !lastName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "All fields are required" })
        };
      }

      // Check if user already exists
      const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
      
      if (existingUsers.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ message: "User already exists with this email" })
        };
      }

      // Create new user
      const newUsers = await sql`
        INSERT INTO users (email, first_name, last_name, is_admin, created_at, updated_at)
        VALUES (${email}, ${firstName}, ${lastName}, false, NOW(), NOW())
        RETURNING *
      `;

      const user = newUsers[0];

      return {
        statusCode: 201,
        headers: {
          ...headers,
          'Set-Cookie': `sessionId=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
        },
        body: JSON.stringify({ 
          message: "Registration successful", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          }
        })
      };
    }

    // LOGOUT
    if (path === '/api/logout' && method === 'POST') {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': 'sessionId=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        },
        body: JSON.stringify({ message: "Logout successful" })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found" })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};