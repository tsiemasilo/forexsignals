// Ultra-simple authentication without any database
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Simple Auth - POST only</h1><p>Send POST with {"email":"almeerahlosper@gmail.com"}</p>'
    };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');
    
    if (email === 'almeerahlosper@gmail.com') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful for Almeerah',
          sessionId: 'simple_' + Date.now(),
          user: { id: 3, email, firstName: 'Almeerah', lastName: 'Losper', isAdmin: false }
        })
      };
    }

    if (email === 'admin@forexsignals.com') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful for Admin',
          sessionId: 'simple_' + Date.now(),
          user: { id: 1, email, firstName: 'Admin', lastName: 'User', isAdmin: true }
        })
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, message: 'Invalid email: ' + email })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Error: ' + error.message })
    };
  }
};