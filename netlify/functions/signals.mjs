import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection instead of pooling for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

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
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get user from session
    const user = await getUserFromSession(event);
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Session expired. Please sign in again.' })
      };
    }

    const { httpMethod, path, queryStringParameters } = event;

    if (httpMethod === 'GET') {
      // Check subscription for non-admin users
      if (!user.is_admin) {
        const subscriptionResult = await sql`
          SELECT status, end_date
          FROM subscriptions
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 1
        `;
        
        const subscription = subscriptionResult[0];
        
        if (!subscription || 
            (subscription.status !== 'active' && subscription.status !== 'trial') || 
            new Date() > subscription.end_date) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: 'Active subscription required' })
          };
        }
      }

      // Get all signals
      const signalsResult = await sql`
        SELECT id, title, content, trade_action as "tradeAction", 
               image_url as "imageUrl", image_urls as "imageUrls", 
               created_by as "createdBy", is_active as "isActive", 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM signals 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(signalsResult)
      };

    } else if (httpMethod === 'POST') {
      // Only admins can create signals
      if (!user.is_admin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      const { title, content, tradeAction, imageUrl, imageUrls } = JSON.parse(event.body);

      if (!title || !content || !tradeAction) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Title, content, and tradeAction are required' })
        };
      }

      const result = await sql`
        INSERT INTO signals (title, content, trade_action, image_url, image_urls, created_by, is_active)
        VALUES (${title}, ${content}, ${tradeAction}, ${imageUrl || null}, ${imageUrls ? JSON.stringify(imageUrls) : null}, ${user.id}, true)
        RETURNING id, title, content, trade_action as "tradeAction", 
                  image_url as "imageUrl", image_urls as "imageUrls",
                  created_by as "createdBy", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };

    } else if (httpMethod === 'PUT') {
      // Update signal - admin only
      if (!user.is_admin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      // Extract signal ID from path or query parameters
      const pathParts = event.path?.split('/') || [];
      let signalId = pathParts[pathParts.length - 1];
      
      // If the last part isn't a number, check query params
      if (isNaN(signalId) || signalId === 'signals') {
        signalId = event.queryStringParameters?.id;
      }
      
      if (!signalId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Signal ID is required for update' })
        };
      }
      
      const updates = JSON.parse(event.body);

      const result = await sql`
        UPDATE signals 
        SET title = COALESCE(${updates.title}, title),
            content = COALESCE(${updates.content}, content),
            trade_action = COALESCE(${updates.tradeAction}, trade_action),
            image_url = COALESCE(${updates.imageUrl}, image_url),
            image_urls = COALESCE(${updates.imageUrls ? JSON.stringify(updates.imageUrls) : null}, image_urls),
            updated_at = NOW()
        WHERE id = ${signalId}
        RETURNING id, title, content, trade_action as "tradeAction", 
                  image_url as "imageUrl", image_urls as "imageUrls",
                  created_by as "createdBy", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };

    } else if (httpMethod === 'DELETE') {
      // Delete signal - admin only  
      if (!user.is_admin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      // Extract signal ID from path or query parameters
      const pathParts = event.path?.split('/') || [];
      let signalId = pathParts[pathParts.length - 1];
      
      // If the last part isn't a number, check query params
      if (isNaN(signalId) || signalId === 'signals') {
        signalId = event.queryStringParameters?.id;
      }
      
      if (!signalId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Signal ID is required for deletion' })
        };
      }

      const result = await sql`
        DELETE FROM signals WHERE id = ${signalId}
        RETURNING id
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Signal deleted successfully' })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }

  } catch (error) {
    console.error('Signals function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};