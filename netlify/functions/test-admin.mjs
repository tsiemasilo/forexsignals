// Test endpoint with database connection check
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

  console.log('🧪 TEST ADMIN FUNCTION CALLED:', {
    method: event.httpMethod,
    path: event.path,
    body: event.body,
    timestamp: new Date().toISOString()
  });

  // Test database connection
  try {
    console.log('🗄️ TESTING DATABASE CONNECTION...');
    const testResult = await sql`SELECT COUNT(*) as signal_count FROM forex_signals`;
    console.log('✅ DATABASE CONNECTION SUCCESS:', testResult);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Test admin function working',
        method: event.httpMethod,
        path: event.path,
        database: 'connected',
        signalCount: testResult[0].signal_count,
        timestamp: new Date().toISOString()
      })
    };
  } catch (dbError) {
    console.error('❌ DATABASE CONNECTION FAILED:', dbError);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Database connection failed',
        error: dbError.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};