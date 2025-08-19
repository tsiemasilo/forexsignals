import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(DATABASE_URL);

// Helper function to get user from session cookie
const getUserFromSession = async (event) => {
  const cookies = event.headers.cookie || '';
  const sessionMatch = cookies.match(/sessionId=([^;]+)/);
  
  if (!sessionMatch) {
    return null;
  }
  
  const userId = parseInt(sessionMatch[1]);
  if (isNaN(userId)) {
    return null;
  }
  
  const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
  return users[0] || null;
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const method = event.httpMethod;
    
    // GET all signals
    if (method === 'GET') {
      // Get all active signals
      const signals = await sql`
        SELECT id, title, content, trade_action, image_url, image_urls, created_by, is_active, created_at, updated_at
        FROM forex_signals 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;

      // Format signals to match frontend expectations
      const formattedSignals = signals.map(signal => ({
        id: signal.id,
        title: signal.title,
        content: signal.content,
        trade_action: signal.trade_action,
        tradeAction: signal.trade_action, // alias for compatibility
        image_url: signal.image_url,
        imageUrl: signal.image_url, // alias for compatibility
        image_urls: signal.image_urls,
        created_by: signal.created_by,
        is_active: signal.is_active,
        created_at: signal.created_at,
        createdAt: signal.created_at, // alias for compatibility
        updated_at: signal.updated_at,
        uploadedImages: signal.image_urls || []
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSignals)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found" })
    };

  } catch (error) {
    console.error('Signals error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};