import { neon } from '@neondatabase/serverless';

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
    // Debug environment variables
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'No database URL found',
          envVars: {
            NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
            DATABASE_URL: !!process.env.DATABASE_URL,
            hasConnectionString: false
          }
        })
      };
    }

    // Test database connection
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as current_time, version()`;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        dbTest: result[0],
        envVars: {
          NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
          DATABASE_URL: !!process.env.DATABASE_URL,
          hasConnectionString: true,
          urlPreview: databaseUrl.substring(0, 30) + '...'
        }
      })
    };

  } catch (error) {
    console.error('Database test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        envVars: {
          NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
          DATABASE_URL: !!process.env.DATABASE_URL
        }
      })
    };
  }
};