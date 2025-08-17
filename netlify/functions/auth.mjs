import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

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

      // Check if user exists
      const user = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
      
      if (user.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            message: 'Account not found. Please register first to create your account.',
            needsRegistration: true 
          })
        };
      }

      // Check if this is the user's first login (no subscription exists)
      const existingSubscription = await sql`
        SELECT * FROM subscriptions WHERE "userId" = ${user[0].id} LIMIT 1
      `;
      
      if (existingSubscription.length === 0) {
        // First login - create 7-day free trial
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        
        await sql`
          INSERT INTO subscriptions ("userId", "planId", status, "startDate", "endDate", "createdAt")
          VALUES (${user[0].id}, 1, 'trial', NOW(), ${endDate.toISOString()}, NOW())
        `;
        
        console.log(`✅ Created 7-day trial for first login: ${email}`);
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

    if (path === 'register' && event.httpMethod === 'POST') {
      const { email, firstName, lastName } = JSON.parse(event.body);
      
      if (!email || !firstName || !lastName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Email, first name, and last name are required' })
        };
      }

      // Check if user already exists
      const existingUser = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
      
      if (existingUser.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ 
            message: 'Account already exists. Please sign in instead.',
            userExists: true 
          })
        };
      }

      // Create new user WITHOUT logging them in or creating a trial
      await sql`
        INSERT INTO users (email, "firstName", "lastName", "isAdmin")
        VALUES (${email}, ${firstName}, ${lastName}, false)
      `;
      
      console.log(`✅ New user registered: ${email} - Account created, please sign in`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Account created successfully! Please sign in to access your account.',
          registrationComplete: true
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