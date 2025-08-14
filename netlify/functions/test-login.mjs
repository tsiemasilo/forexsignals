// Simple test login without database - just for authentication testing
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email } = body;
    
    console.log('Test login attempt with email:', email);

    // Simple validation without database
    if (email === 'almeerahlosper@gmail.com' || email === 'admin@forexsignals.com') {
      const sessionId = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const userInfo = email === 'admin@forexsignals.com' ? {
        id: 1,
        email: 'admin@forexsignals.com',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true
      } : {
        id: 3,
        email: 'almeerahlosper@gmail.com',
        firstName: 'Almeerah',
        lastName: 'Losper',
        isAdmin: false
      };

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${7 * 24 * 60 * 60}`
        },
        body: JSON.stringify({
          message: 'Test login successful',
          sessionId: sessionId,
          user: userInfo
        })
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        message: 'Invalid email',
        receivedEmail: email 
      })
    };

  } catch (error) {
    console.error('Test login error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};