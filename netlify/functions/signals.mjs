import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Safe JSON parsing helper function
  function safeParseImageUrls(imageUrlsText, signalId) {
    console.log(`Parsing image URLs for signal ${signalId}:`, imageUrlsText);
    
    if (!imageUrlsText) {
      console.log(`No image URLs for signal ${signalId}`);
      return [];
    }

    try {
      // Handle data URLs that start with 'data:image'
      if (typeof imageUrlsText === 'string' && imageUrlsText.startsWith('data:image')) {
        console.log(`Signal ${signalId} has single data URL, wrapping in array`);
        return [imageUrlsText];
      }

      // Try to parse as JSON array
      if (typeof imageUrlsText === 'string') {
        const parsed = JSON.parse(imageUrlsText);
        console.log(`Successfully parsed JSON for signal ${signalId}:`, Array.isArray(parsed) ? `${parsed.length} URLs` : 'Single URL');
        return Array.isArray(parsed) ? parsed : [parsed];
      }

      // If already an array, return as is
      if (Array.isArray(imageUrlsText)) {
        console.log(`Signal ${signalId} already has array of ${imageUrlsText.length} URLs`);
        return imageUrlsText;
      }

      console.log(`Signal ${signalId} has unrecognized format, returning as single item array`);
      return [imageUrlsText];

    } catch (error) {
      console.error(`Error parsing image URLs for signal ${signalId}:`, error.message);
      // If JSON parsing fails but it's a data URL, return it as single item array
      if (typeof imageUrlsText === 'string' && imageUrlsText.includes('data:image')) {
        console.log(`Signal ${signalId} treating as single data URL after parse error`);
        return [imageUrlsText];
      }
      console.log(`Signal ${signalId} returning empty array due to parse error`);
      return [];
    }
  }

  // Database connection using environment variables
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('No database URL found in environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Database configuration error' })
    };
  }

  console.log('Using database URL:', databaseUrl.substring(0, 30) + '...');
  const sql = neon(databaseUrl);

  try {
    // Extract JWT token from Authorization header
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Authentication required' })
      };
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');

    // Verify JWT token
    let decoded;
    try {
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'watchlistfx-default-secret-2025';
      decoded = jwt.default.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }

    const userId = decoded.userId;
    const isAdmin = decoded.isAdmin || false;

    console.log('Token validated for user:', userId, 'Admin:', isAdmin);

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid token payload' })
      };
    }

    const { httpMethod, path } = event;

    // Check if this is a request for a specific signal
    const pathParts = path.split('/');
    const isSpecificSignal = pathParts.length > 3 && pathParts[3];
    const signalId = isSpecificSignal ? parseInt(pathParts[3]) : null;

    console.log('Request details:', { httpMethod, path, isSpecificSignal, signalId });

    if (httpMethod === 'GET') {
      // Check subscription access for non-admin users
      if (!isAdmin) {
        const subscriptionResult = await sql`
          SELECT * FROM subscriptions 
          WHERE user_id = ${userId} 
          ORDER BY created_at DESC 
          LIMIT 1
        `;

        console.log('Subscription check for user:', userId, 'Found:', subscriptionResult.length > 0);

        if (subscriptionResult.length === 0) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: 'Active subscription required' })
          };
        }

        const subscription = subscriptionResult[0];
        const now = new Date();
        const isActiveSubscription = subscription.status === "active" && new Date(subscription.end_date) > now;
        const isActiveTrial = subscription.status === "trial" && new Date(subscription.end_date) > now;

        console.log('Subscription status:', {
          status: subscription.status,
          endDate: subscription.end_date,
          isActiveSubscription,
          isActiveTrial
        });

        if (!isActiveSubscription && !isActiveTrial) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: 'Active subscription required' })
          };
        }

        // Get user details for logging
        const userResult = await sql`SELECT email FROM users WHERE id = ${userId}`;
        const user = userResult[0];
        console.log('Access granted for user:', {
          userId,
          userEmail: user.email
        });
      }

      if (isSpecificSignal && signalId) {
        // Get specific signal
        const signalsResult = await sql`
          SELECT id, title, content, trade_action, 
                 image_url, image_urls, 
                 created_by, is_active, 
                 created_at, updated_at
          FROM signals 
          WHERE id = ${signalId} AND is_active = true
        `;
        
        if (signalsResult.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Signal not found' })
          };
        }
        
        // Format single signal response
        const signal = signalsResult[0];
        const formattedSignal = {
          id: signal.id,
          title: signal.title,
          content: signal.content,
          tradeAction: signal.trade_action,
          imageUrl: signal.image_url,
          imageUrls: safeParseImageUrls(signal.image_urls, signal.id),
          createdBy: signal.created_by,
          isActive: signal.is_active,
          createdAt: signal.created_at,
          updatedAt: signal.updated_at
        };
        
        console.log('Returning single signal:', signalId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formattedSignal)
        };
      } else {
        // Get all signals
        const signalsResult = await sql`
          SELECT id, title, content, trade_action, 
                 image_url, image_urls, 
                 created_by, is_active, 
                 created_at, updated_at
          FROM signals 
          WHERE is_active = true
          ORDER BY created_at DESC
        `;
        
        // Format the response to match frontend expectations with safe JSON parsing
        const formattedSignals = signalsResult.map(signal => ({
          id: signal.id,
          title: signal.title,
          content: signal.content,
          tradeAction: signal.trade_action,
          imageUrl: signal.image_url,
          imageUrls: safeParseImageUrls(signal.image_urls, signal.id),
          createdBy: signal.created_by,
          isActive: signal.is_active,
          createdAt: signal.created_at,
          updatedAt: signal.updated_at
        }));
        
        console.log('Returning all signals:', formattedSignals.length);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(formattedSignals)
        };
      }

    } else if (httpMethod === 'POST') {
      // Only admins can create signals
      if (!isAdmin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      const { title, content, tradeAction, imageUrls } = JSON.parse(event.body);

      // Insert new signal
      const result = await sql`
        INSERT INTO signals (title, content, trade_action, image_urls, created_by, is_active, created_at, updated_at)
        VALUES (${title}, ${content}, ${tradeAction}, ${JSON.stringify(imageUrls)}, ${userId}, true, NOW(), NOW())
        RETURNING *
      `;

      const newSignal = result[0];
      const formattedSignal = {
        id: newSignal.id,
        title: newSignal.title,
        content: newSignal.content,
        tradeAction: newSignal.trade_action,
        imageUrl: newSignal.image_url,
        imageUrls: safeParseImageUrls(newSignal.image_urls, newSignal.id),
        createdBy: newSignal.created_by,
        isActive: newSignal.is_active,
        createdAt: newSignal.created_at,
        updatedAt: newSignal.updated_at
      };

      console.log('Created new signal:', newSignal.id);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(formattedSignal)
      };

    } else if (httpMethod === 'PUT') {
      // Only admins can update signals
      if (!isAdmin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      if (!signalId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Signal ID required for updates' })
        };
      }

      const { title, content, tradeAction, imageUrls } = JSON.parse(event.body);

      // Update signal
      const result = await sql`
        UPDATE signals 
        SET title = ${title}, content = ${content}, trade_action = ${tradeAction}, 
            image_urls = ${JSON.stringify(imageUrls)}, updated_at = NOW()
        WHERE id = ${signalId}
        RETURNING *
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found' })
        };
      }

      const updatedSignal = result[0];
      const formattedSignal = {
        id: updatedSignal.id,
        title: updatedSignal.title,
        content: updatedSignal.content,
        tradeAction: updatedSignal.trade_action,
        imageUrl: updatedSignal.image_url,
        imageUrls: safeParseImageUrls(updatedSignal.image_urls, updatedSignal.id),
        createdBy: updatedSignal.created_by,
        isActive: updatedSignal.is_active,
        createdAt: updatedSignal.created_at,
        updatedAt: updatedSignal.updated_at
      };

      console.log('Updated signal:', signalId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSignal)
      };

    } else if (httpMethod === 'DELETE') {
      // Only admins can delete signals
      if (!isAdmin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Admin access required' })
        };
      }

      if (!signalId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Signal ID required for deletion' })
        };
      }

      // Soft delete by setting is_active to false
      const result = await sql`
        UPDATE signals 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${signalId}
        RETURNING id
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Signal not found' })
        };
      }

      console.log('Deleted signal:', signalId);
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
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
}