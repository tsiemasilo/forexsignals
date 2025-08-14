import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection for Netlify compatibility
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

// Helper function to get user from session
const getUserFromSession = async (event) => {
  const cookies = event.headers.cookie || '';
  const sessionMatch = cookies.match(/sessionId=([^;]+)/);
  
  if (!sessionMatch) {
    return null;
  }

  const sessionId = sessionMatch[1];
  
  const result = await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.is_admin, s.expire
    FROM sessions s
    JOIN users u ON (s.sess->>'user')::jsonb->>'id' = u.id::text
    WHERE s.sid = ${sessionId} AND s.expire > NOW()
  `;
  
  return result[0] || null;
};

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Request method:', event.httpMethod);
    console.log('Request path:', event.path);
    
    // Get user from session and verify admin access
    const user = await getUserFromSession(event);
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Session expired. Please sign in again.' })
      };
    }

    if (!user.is_admin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Admin access required' })
      };
    }
    
    // Extract user ID from path: /api/admin/users/3/subscription
    const pathParts = event.path.split('/').filter(part => part.length > 0);
    console.log('Path parts:', pathParts);
    
    const userIndex = pathParts.indexOf('users');
    const userId = userIndex >= 0 && userIndex + 1 < pathParts.length ? pathParts[userIndex + 1] : null;
    console.log('Extracted user ID:', userId);
    
    if (event.httpMethod === 'PATCH' || event.httpMethod === 'PUT') {
      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User ID not found in path' })
        };
      }
      
      const body = JSON.parse(event.body || '{}');
      const { status } = body;
      console.log('Update request:', { userId, status });

      // Calculate end date based on status
      let endDate = null;
      if (status === 'active') {
        const now = new Date();
        now.setDate(now.getDate() + 14); // Add 14 days for active subscription
        endDate = now.toISOString();
      }

      // Update user subscription
      await sql`
        UPDATE user_subscriptions 
        SET status = ${status}, end_date = ${endDate}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Subscription updated successfully',
          status,
          endDate 
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Admin subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};