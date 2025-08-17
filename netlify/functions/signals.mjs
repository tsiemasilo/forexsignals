import { neon } from '@neondatabase/serverless';

// Use NETLIFY_DATABASE_URL first, then DATABASE_URL, then fallback
const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

let sql;
try {
  sql = neon(databaseUrl);
} catch (error) {
  console.error('Database connection error:', error);
}

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (!sql) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          message: 'Database connection failed',
          error: 'Unable to connect to database'
        })
      };
    }

    const method = event.httpMethod;
    const path = event.path;

    if (method === 'GET' && (path === '/api/signals' || path.includes('/signals'))) {
      // Get all signals
      const signals = await sql`
        SELECT * FROM forex_signals 
        ORDER BY "createdAt" DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(signals.map(signal => ({
          ...signal,
          uploadedImages: signal.uploadedImages ? JSON.parse(signal.uploadedImages) : []
        })))
      };
    }

    if (method === 'POST' && path === '/api/signals') {
      const { title, content, tradeAction, uploadedImages } = JSON.parse(event.body);

      const result = await sql`
        INSERT INTO forex_signals (title, content, "tradeAction", "uploadedImages", "createdAt", "updatedAt")
        VALUES (${title}, ${content}, ${tradeAction}, ${JSON.stringify(uploadedImages || [])}, NOW(), NOW())
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          ...result[0],
          uploadedImages: result[0].uploadedImages ? JSON.parse(result[0].uploadedImages) : []
        })
      };
    }

    if (method === 'PUT' && path.startsWith('/api/signals/')) {
      const signalId = parseInt(path.split('/')[3]);
      const { title, content, tradeAction, uploadedImages } = JSON.parse(event.body);

      const result = await sql`
        UPDATE forex_signals 
        SET title = ${title}, content = ${content}, "tradeAction" = ${tradeAction}, 
            "uploadedImages" = ${JSON.stringify(uploadedImages || [])}, "updatedAt" = NOW()
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...result[0],
          uploadedImages: result[0].uploadedImages ? JSON.parse(result[0].uploadedImages) : []
        })
      };
    }

    if (method === 'DELETE' && path.startsWith('/api/signals/')) {
      const signalId = parseInt(path.split('/')[3]);

      const result = await sql`
        DELETE FROM forex_signals 
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Signal deleted successfully' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error) {
    console.error('Signals function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};