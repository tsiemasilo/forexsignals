// Minimal signal creation endpoint for testing
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

  if (event.httpMethod === 'POST') {
    console.log('🚀 SIMPLE SIGNAL CREATE ATTEMPT');
    
    try {
      // Simple hardcoded signal creation for testing (using admin user ID 1)
      const result = await sql`
        INSERT INTO forex_signals (title, content, trade_action, image_urls, created_by, created_at, updated_at)
        VALUES ('Test Signal', 'This is a test signal from simple endpoint', 'buy', NULL, 1, NOW(), NOW())
        RETURNING *
      `;
      
      console.log('✅ SIMPLE SIGNAL CREATED:', result[0]);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'Signal created successfully',
          signal: result[0]
        })
      };
      
    } catch (error) {
      console.error('❌ SIMPLE SIGNAL CREATION FAILED:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Signal creation failed',
          error: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: 'Method not allowed' })
  };
};