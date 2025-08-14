import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection for Netlify compatibility
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

// Admin Signals API function
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get signals from database using correct schema
      const result = await sql`
        SELECT id, title, content, trade_action, 
               image_url, image_urls, 
               created_by, is_active, 
               created_at, updated_at
        FROM signals 
        ORDER BY created_at DESC
      `;
      
      // Format the response to match frontend expectations
      const formattedSignals = result.map(signal => ({
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
    }

    if (event.httpMethod === 'POST') {
      // Handle signal creation
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid JSON' })
        };
      }

      const { title, content, tradeAction, imageUrl, imageUrls } = body;

      if (!title || !content || !tradeAction) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Title, content, and tradeAction are required' })
        };
      }

      const result = await sql`
        INSERT INTO signals (title, content, trade_action, image_url, image_urls, created_by, is_active)
        VALUES (${title}, ${content}, ${tradeAction}, ${imageUrl || null}, ${imageUrls ? JSON.stringify(imageUrls) : null}, 1, true)
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
        statusCode: 201,
        headers,
        body: JSON.stringify(formattedSignal)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Admin Signals API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};