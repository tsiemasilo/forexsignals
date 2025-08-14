import { neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for Netlify serverless - disable WebSocket for HTTP pooling
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

let pool;
try {
  pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000
  });
} catch (poolError) {
  console.error('Pool creation failed:', poolError);
}

// Helper function to get user from session
const getUserFromSession = async (event) => {
  const cookies = event.headers.cookie || '';
  const sessionMatch = cookies.match(/sessionId=([^;]+)/);
  
  if (!sessionMatch) {
    return null;
  }

  const sessionId = sessionMatch[1];
  
  const sessionQuery = `
    SELECT u.id, u.email, u.first_name, u.last_name, u.is_admin, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_id = $1 AND s.expires_at > NOW()
  `;
  
  const result = await pool.query(sessionQuery, [sessionId]);
  return result.rows[0] || null;
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
        const subscriptionQuery = `
          SELECT status, end_date
          FROM subscriptions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `;
        
        const subscriptionResult = await pool.query(subscriptionQuery, [user.id]);
        const subscription = subscriptionResult.rows[0];
        
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
      const signalsQuery = `
        SELECT id, title, content, trade_action as "tradeAction", 
               image_url as "imageUrl", image_urls as "imageUrls", 
               created_by as "createdBy", is_active as "isActive", 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM signals 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      
      const signalsResult = await pool.query(signalsQuery);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(signalsResult.rows)
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

      const insertQuery = `
        INSERT INTO signals (title, content, trade_action, image_url, image_urls, created_by, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        RETURNING id, title, content, trade_action as "tradeAction", 
                  image_url as "imageUrl", image_urls as "imageUrls",
                  created_by as "createdBy", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await pool.query(insertQuery, [
        title, content, tradeAction, imageUrl || null, 
        imageUrls ? JSON.stringify(imageUrls) : null, user.id
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
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

      const updateQuery = `
        UPDATE signals 
        SET title = COALESCE($1, title),
            content = COALESCE($2, content),
            trade_action = COALESCE($3, trade_action),
            image_url = COALESCE($4, image_url),
            image_urls = COALESCE($5, image_urls),
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, title, content, trade_action as "tradeAction", 
                  image_url as "imageUrl", image_urls as "imageUrls",
                  created_by as "createdBy", is_active as "isActive",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await pool.query(updateQuery, [
        updates.title, updates.content, updates.tradeAction,
        updates.imageUrl, updates.imageUrls ? JSON.stringify(updates.imageUrls) : null,
        signalId
      ]);

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
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

      const deleteQuery = `
        DELETE FROM signals WHERE id = $1
        RETURNING id
      `;

      const result = await pool.query(deleteQuery, [signalId]);

      if (result.rows.length === 0) {
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