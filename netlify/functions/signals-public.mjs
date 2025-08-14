import { neon } from '@neondatabase/serverless';

// Use direct HTTP connection instead of pooling for Netlify
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

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
    // For demo/emergency access - return signals without strict auth
    if (event.httpMethod === 'GET') {
      const result = await sql`
        SELECT id, title, content, trade_action, 
               image_url, image_urls, created_by, is_active, 
               created_at, updated_at
        FROM signals 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      
      const formattedSignals = result.map(signal => ({
        id: signal.id,
        title: signal.title,
        content: signal.content,
        tradeAction: signal.trade_action,
        imageUrl: signal.image_url,
        imageUrls: signal.image_urls ? JSON.parse(signal.image_urls) : ["/api/placeholder/400/300"],
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

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Signals error:', error);
    
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