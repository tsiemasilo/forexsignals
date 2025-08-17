export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Test function working',
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'production',
          NETLIFY_DATABASE_URL_EXISTS: !!process.env.NETLIFY_DATABASE_URL,
          DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
          USING_DATABASE: databaseUrl.includes('ep-sweet-surf') ? 'Correct Neon Database' : 'Other Database',
          EVENT_PATH: event.path,
          EVENT_METHOD: event.httpMethod
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Test function error',
        error: error.message
      })
    };
  }
};