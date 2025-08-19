import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(DATABASE_URL);

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
    const path = event.path;

    console.log('🔧 ADMIN SIGNALS FIXED REQUEST:', { path, method, body: event.body });

    // GET all signals for admin
    if (method === 'GET') {
      const signals = await sql`
        SELECT id, title, content, trade_action, image_url, created_by, is_active, created_at, updated_at
        FROM forex_signals 
        ORDER BY created_at DESC
      `;

      const formattedSignals = signals.map(signal => ({
        id: signal.id,
        title: signal.title,
        content: signal.content,
        tradeAction: signal.trade_action,
        imageUrl: signal.image_url,
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

    // CREATE new signal
    if (method === 'POST') {
      const { title, content, tradeAction, imageUrl } = JSON.parse(event.body || '{}');
      
      console.log('📝 CREATING SIGNAL:', { title, content, tradeAction, imageUrl });
      
      if (!title || !content || !tradeAction) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Title, content, and trade action are required" })
        };
      }

      console.log('🔧 INSERTING INTO DATABASE...');
      const result = await sql`
        INSERT INTO forex_signals (title, content, trade_action, image_url, created_by, is_active, created_at, updated_at)
        VALUES (${title}, ${content}, ${tradeAction}, ${imageUrl || null}, 1, true, NOW(), NOW())
        RETURNING id, title, content, trade_action, image_url, created_by, is_active, created_at, updated_at
      `;

      console.log('✅ INSERT RESULT:', result);
      
      if (!result || result.length === 0) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: "Failed to create signal" })
        };
      }

      const signal = result[0];
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: signal.id,
          title: signal.title,
          content: signal.content,
          tradeAction: signal.trade_action,
          imageUrl: signal.image_url,
          createdBy: signal.created_by,
          isActive: signal.is_active,
          createdAt: signal.created_at,
          updatedAt: signal.updated_at
        })
      };
    }

    // UPDATE signal
    if (method === 'PUT') {
      const signalIdMatch = path.match(/\/signals\/(\d+)/);
      if (!signalIdMatch) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Signal ID is required" })
        };
      }

      const signalId = parseInt(signalIdMatch[1]);
      const { title, content, tradeAction, imageUrl, isActive } = JSON.parse(event.body || '{}');

      const result = await sql`
        UPDATE forex_signals 
        SET 
          title = COALESCE(${title}, title),
          content = COALESCE(${content}, content),
          trade_action = COALESCE(${tradeAction}, trade_action),
          image_url = COALESCE(${imageUrl}, image_url),
          is_active = COALESCE(${isActive}, is_active),
          updated_at = NOW()
        WHERE id = ${signalId}
        RETURNING *
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Signal not found" })
        };
      }

      const signal = result[0];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: signal.id,
          title: signal.title,
          content: signal.content,
          tradeAction: signal.trade_action,
          imageUrl: signal.image_url,
          createdBy: signal.created_by,
          isActive: signal.is_active,
          createdAt: signal.created_at,
          updatedAt: signal.updated_at
        })
      };
    }

    // DELETE signal
    if (method === 'DELETE') {
      const signalIdMatch = path.match(/\/signals\/(\d+)/);
      if (!signalIdMatch) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Signal ID is required" })
        };
      }

      const signalId = parseInt(signalIdMatch[1]);
      
      const result = await sql`DELETE FROM forex_signals WHERE id = ${signalId} RETURNING id`;
      
      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Signal not found" })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Signal deleted successfully" })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found" })
    };

  } catch (error) {
    console.error('❌ Admin signals error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};