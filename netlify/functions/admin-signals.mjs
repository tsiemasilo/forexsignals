// Dedicated admin signals endpoint
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

  console.log('🔧 ADMIN SIGNALS FUNCTION CALLED:', {
    method: event.httpMethod,
    path: event.path,
    bodyLength: event.body?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Test database connection first
  try {
    console.log('🗄️ TESTING DATABASE CONNECTION...');
    const testResult = await sql`SELECT 1 as test`;
    console.log('✅ DATABASE CONNECTION SUCCESS:', testResult);
  } catch (dbTestError) {
    console.error('❌ DATABASE CONNECTION FAILED:', dbTestError);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Database connection failed', error: dbTestError.message })
    };
  }

  try {
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'GET') {
      console.log('📋 GET ADMIN SIGNALS');
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

    if (method === 'POST') {
      console.log('✨ POST ADMIN SIGNAL CREATE');
      console.log('📨 Request body:', event.body);
      
      if (!event.body) {
        console.error('❌ NO REQUEST BODY');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Request body is required' })
        };
      }
      
      let requestData;
      try {
        requestData = JSON.parse(event.body);
        console.log('📋 PARSED REQUEST DATA:', requestData);
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid JSON in request body', error: parseError.message })
        };
      }
      
      const { title, content, tradeAction, uploadedImages, imageUrls } = requestData;
      
      // Validate required fields
      if (!title || !content || !tradeAction) {
        console.error('❌ MISSING REQUIRED FIELDS:', { title: !!title, content: !!content, tradeAction: !!tradeAction });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Missing required fields: title, content, and tradeAction are required' })
        };
      }
      
      const finalImages = uploadedImages || imageUrls || [];
      console.log('✅ PROCEEDING WITH DATABASE INSERT:', { title, content, tradeAction, imageCount: finalImages.length });

      let result;
      try {
        console.log('🗄️ EXECUTING DATABASE INSERT...');
        console.log('Image data being inserted:', finalImages, 'Type:', typeof finalImages);
        
        // Handle empty array properly for PostgreSQL
        const imageUrlsJson = finalImages.length === 0 ? null : JSON.stringify(finalImages);
        
        result = await sql`
          INSERT INTO forex_signals (title, content, trade_action, image_urls, created_at, updated_at)
          VALUES (${title}, ${content}, ${tradeAction}, ${imageUrlsJson}, NOW(), NOW())
          RETURNING *
        `;
        console.log('✅ DATABASE INSERT SUCCESS:', result[0]);
      } catch (dbError) {
        console.error('❌ DATABASE INSERT ERROR:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Database error', error: dbError.message })
        };
      }

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

    if (method === 'PUT') {
      console.log('📝 PUT ADMIN SIGNAL UPDATE');
      const pathParts = path.split('/');
      const signalId = parseInt(pathParts[pathParts.length - 1]);
      const { title, content, tradeAction, uploadedImages, imageUrls } = JSON.parse(event.body);
      const finalImages = uploadedImages || imageUrls || [];

      const imageUrlsJson = finalImages.length === 0 ? null : JSON.stringify(finalImages);
      
      const result = await sql`
        UPDATE forex_signals 
        SET title = ${title}, content = ${content}, trade_action = ${tradeAction}, 
            image_urls = ${imageUrlsJson}, updated_at = NOW()
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

    if (method === 'DELETE') {
      console.log('🗑️ DELETE ADMIN SIGNAL');
      const pathParts = path.split('/');
      const signalId = parseInt(pathParts[pathParts.length - 1]);

      const result = await sql`
        DELETE FROM forex_signals 
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
        body: JSON.stringify({ message: 'Signal deleted successfully' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('💥 ADMIN SIGNALS FUNCTION ERROR:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};