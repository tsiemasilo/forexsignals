import { neon } from '@neondatabase/serverless';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Database connection
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Database configuration error',
          env_vars: Object.keys(process.env).filter(key => key.includes('DATABASE'))
        })
      };
    }

    const sql = neon(databaseUrl);

    // Extract session details from cookies - check both formats
    const cookies = event.headers.cookie || '';
    console.log('🔍 DEBUG - Full cookies:', cookies);
    
    // Try both sessionId and connect.sid formats
    let sessionMatch = cookies.match(/sessionId=([^;]+)/);
    let rawSessionId = sessionMatch ? sessionMatch[1] : null;
    let sessionId = rawSessionId;
    
    if (!sessionId) {
      sessionMatch = cookies.match(/connect\.sid=([^;]+)/);
      rawSessionId = sessionMatch ? sessionMatch[1] : null;
      sessionId = rawSessionId ? decodeURIComponent(rawSessionId).replace(/^s:/, '').split('.')[0] : null;
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        raw: cookies,
        hasCookies: !!cookies,
        sessionMatch: !!sessionMatch,
        rawSessionId,
        cleanSessionId: sessionId
      },
      headers: {
        userAgent: event.headers['user-agent'],
        referer: event.headers.referer,
        origin: event.headers.origin
      },
      environment: {
        hasNetlifyDb: !!process.env.NETLIFY_DATABASE_URL,
        hasRegularDb: !!process.env.DATABASE_URL,
        dbUrlSubstring: databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'None'
      }
    };

    // Try to get session data if we have session ID
    if (sessionId) {
      try {
        const sessionResult = await sql`
          SELECT sid, sess, expire FROM sessions 
          WHERE sid = ${sessionId}
        `;

        debugInfo.session = {
          found: sessionResult.length > 0,
          count: sessionResult.length
        };

        if (sessionResult.length > 0) {
          const session = sessionResult[0];
          debugInfo.session.data = {
            hasUserId: !!session.sess.userId,
            userId: session.sess.userId,
            isAdmin: session.sess.isAdmin,
            expired: new Date() > new Date(session.expire),
            expireDate: session.expire
          };
        }
      } catch (dbError) {
        debugInfo.session = {
          error: dbError.message
        };
      }
    } else {
      debugInfo.session = {
        error: 'No session ID found in cookies'
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(debugInfo, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      })
    };
  }
}