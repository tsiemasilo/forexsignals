// Simplified login function for testing
export const handler = async (event, context) => {
  try {
    // Basic CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    // Check if this is a POST to login
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid JSON' })
      };
    }

    // Handle both email-only and username/password login
    const { email, username, password } = body;
    
    // Log the request for debugging
    console.log('Login request received:', { 
      hasEmail: !!email, 
      hasUsername: !!username, 
      hasPassword: !!password,
      body: JSON.stringify(body)
    });

    // Valid users from your database
    const validUsers = [
      { email: 'admin@forexsignals.com', id: '1', role: 'admin', firstName: 'Admin', lastName: 'User' },
      { email: 'tsiemasilo@gmail.com', id: '2', role: 'user', firstName: 'Tsie', lastName: 'Masilo' },
      { email: 'almeerahlosper@gmail.com', id: '3', role: 'user', firstName: 'Almeerah', lastName: 'Losper' }
    ];

    // Find user by email (main login method)
    const loginEmail = email || username;
    const validUser = validUsers.find(user => user.email === loginEmail);

    if (validUser) {
      // Generate a session ID for the frontend
      const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Login successful',
          sessionId: sessionId,
          user: {
            id: parseInt(validUser.id),
            email: validUser.email,
            firstName: validUser.firstName,
            lastName: validUser.lastName,
            isAdmin: validUser.role === 'admin'
          }
        })
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        message: 'Invalid credentials',
        receivedEmail: loginEmail 
      })
    };

  } catch (error) {
    console.error('Login function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};