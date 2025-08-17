import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

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
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'GET' && (path === '/api/signals' || path === '/api/admin/signals')) {
      // Get all signals
      const signals = await sql`
        SELECT * FROM forex_signals 
        ORDER BY created_at DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(signals.map(signal => ({
          ...signal,
          uploadedImages: signal.image_urls ? JSON.parse(signal.image_urls) : [],
          tradeAction: signal.trade_action
        })))
      };
    }

    if (method === 'POST' && (path === '/api/signals' || path === '/api/admin/signals')) {
      console.log('📨 POST SIGNAL REQUEST:', {
        method,
        path,
        body: event.body,
        headers: event.headers,
        timestamp: new Date().toISOString()
      });
      
      const requestData = JSON.parse(event.body);
      console.log('📋 PARSED REQUEST DATA:', requestData);
      
      const { title, content, tradeAction, uploadedImages, imageUrls } = requestData;
      const finalImages = uploadedImages || imageUrls || [];

      const result = await sql`
        INSERT INTO forex_signals (title, content, trade_action, image_urls, created_at, updated_at)
        VALUES (${title}, ${content}, ${tradeAction}, ${JSON.stringify(finalImages)}, NOW(), NOW())
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          ...result[0],
          uploadedImages: result[0].image_urls ? JSON.parse(result[0].image_urls) : [],
          tradeAction: result[0].trade_action
        })
      };
    }

    if (method === 'PUT' && (path.startsWith('/api/signals/') || path.startsWith('/api/admin/signals/'))) {
      const pathParts = path.split('/');
      const signalId = parseInt(pathParts[pathParts.length - 1]);
      const { title, content, tradeAction, uploadedImages } = JSON.parse(event.body);

      const result = await sql`
        UPDATE forex_signals 
        SET title = ${title}, content = ${content}, trade_action = ${tradeAction}, 
            image_urls = ${JSON.stringify(uploadedImages || [])}, updated_at = NOW()
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
          uploadedImages: result[0].image_urls ? JSON.parse(result[0].image_urls) : [],
          tradeAction: result[0].trade_action
        })
      };
    }

    if (method === 'DELETE' && (path.startsWith('/api/signals/') || path.startsWith('/api/admin/signals/'))) {
      const pathParts = path.split('/');
      const signalId = parseInt(pathParts[pathParts.length - 1]);

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
    console.error('Signals function error:', {
      error: error.message,
      stack: error.stack,
      method: event.httpMethod,
      path: event.path,
      body: event.body,
      headers: event.headers,
      timestamp: new Date().toISOString()
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message,
        details: `Method: ${event.httpMethod}, Path: ${event.path}`
      })
    };
  }
};