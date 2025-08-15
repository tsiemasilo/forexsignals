import { neon } from '@neondatabase/serverless';

// Use environment variable for database connection
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
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

    const { httpMethod } = event;

    if (httpMethod === 'GET') {
      // SUBSCRIPTION DEBUG LOGGING
      console.log('🔍 SUBSCRIPTION CHECK DEBUG:', {
        userId: user.id,
        userEmail: user.email,
        isAdmin: user.is_admin,
        timestamp: new Date().toISOString()
      });
      
      // ADMIN BYPASS: Admins can always access signals
      if (!user.is_admin) {
        // Check subscription for non-admin users only
        const subscriptionResult = await sql`
          SELECT status, end_date, start_date, created_at
          FROM subscriptions
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 1
        `;
        
        const subscription = subscriptionResult[0];
        
        // Enhanced subscription debug logging
        console.log('🔍 SUBSCRIPTION VALIDATION DETAILS:', {
          userId: user.id,
          subscriptionFound: !!subscription,
          subscription: subscription,
          currentTime: new Date().toISOString(),
          endDatePassed: subscription ? new Date() > subscription.end_date : null,
          isActiveOrTrial: subscription ? (subscription.status === 'active' || subscription.status === 'trial') : false
        });
        
        if (!subscription || 
            (subscription.status !== 'active' && subscription.status !== 'trial') || 
            new Date() > subscription.end_date) {
          
          console.log('❌ SUBSCRIPTION ACCESS DENIED:', {
            userId: user.id,
            reason: !subscription ? 'No subscription found' : 
                   (subscription.status !== 'active' && subscription.status !== 'trial') ? `Invalid status: ${subscription.status}` :
                   'Subscription expired',
            subscription: subscription
          });
          
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: 'Active subscription required' })
          };
        }
        
        console.log('✅ SUBSCRIPTION ACCESS GRANTED:', {
          userId: user.id,
          subscription: subscription
        });
      } else {
        console.log('✅ ADMIN ACCESS GRANTED:', {
          userId: user.id,
          userEmail: user.email
        });
      }

      // Get all signals - admins and active subscribers can see all
      const signalsResult = await sql`
        SELECT id, title, content, trade_action, 
               image_url, image_urls, 
               created_by, is_active, 
               created_at, updated_at
        FROM signals 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      
      // Format the response to match frontend expectations
      const formattedSignals = signalsResult.map(signal => ({
        id: signal.id,
        title: signal.title,
        content: signal.content,
        tradeAction: signal.trade_action,
        imageUrl: signal.image_url,
        imageUrls: signal.image_urls ? JSON.parse(signal.image_urls) : [],
        createdBy: signal.created_by,
        isActive: signal.is_active,
        createdAt: signal.created_at,
        updatedAt: signal.updated_at
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSignals)
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

      // Handle imageUrls properly - convert to JSON string or null
      const imageUrlsJson = imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
      
      const result = await sql`
        INSERT INTO signals (title, content, trade_action, image_url, image_urls, created_by, is_active)
        VALUES (${title}, ${content}, ${tradeAction}, ${imageUrl || null}, ${imageUrlsJson}, ${user.id}, true)
        RETURNING id, title, content, trade_action, 
                  image_url, image_urls,
                  created_by, is_active,
                  created_at, updated_at
      `;

      // Format response
      const formattedSignal = {
        id: result[0].id,
        title: result[0].title,
        content: result[0].content,
        tradeAction: result[0].trade_action,
        imageUrl: result[0].image_url,
        imageUrls: result[0].image_urls ? JSON.parse(result[0].image_urls) : [],
        createdBy: result[0].created_by,
        isActive: result[0].is_active,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSignal)
      };

    } else if (httpMethod === 'PUT') {
      // Only admins can update signals
      if (!user.is_admin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      // Extract signal ID from path
      const pathParts = event.path.split('/');
      const signalId = pathParts[pathParts.length - 1];
      
      if (!signalId || isNaN(parseInt(signalId))) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid signal ID' })
        };
      }

      const { title, content, tradeAction, imageUrl, imageUrls } = JSON.parse(event.body);

      // Handle imageUrls properly for update
      const imageUrlsJson = imageUrls && imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
      
      const result = await sql`
        UPDATE signals 
        SET title = ${title}, 
            content = ${content}, 
            trade_action = ${tradeAction},
            image_url = ${imageUrl || null},
            image_urls = ${imageUrlsJson},
            updated_at = NOW()
        WHERE id = ${parseInt(signalId)} AND created_by = ${user.id}
        RETURNING id, title, content, trade_action, 
                  image_url, image_urls,
                  created_by, is_active,
                  created_at, updated_at
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found or access denied' })
        };
      }

      // Format response
      const formattedSignal = {
        id: result[0].id,
        title: result[0].title,
        content: result[0].content,
        tradeAction: result[0].trade_action,
        imageUrl: result[0].image_url,
        imageUrls: result[0].image_urls ? JSON.parse(result[0].image_urls) : [],
        createdBy: result[0].created_by,
        isActive: result[0].is_active,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSignal)
      };

    } else if (httpMethod === 'DELETE') {
      // Only admins can delete signals
      if (!user.is_admin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      // Extract signal ID from path
      const pathParts = event.path.split('/');
      const signalId = pathParts[pathParts.length - 1];
      
      if (!signalId || isNaN(parseInt(signalId))) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid signal ID' })
        };
      }

      const result = await sql`
        DELETE FROM signals 
        WHERE id = ${parseInt(signalId)} AND created_by = ${user.id}
        RETURNING id
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found or access denied' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Signal deleted successfully', id: result[0].id })
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
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};