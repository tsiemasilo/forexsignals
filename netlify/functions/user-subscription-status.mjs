// User subscription status API function
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Extract session info from headers or query params
    const authHeader = event.headers.authorization || '';
    const sessionId = authHeader.replace('Bearer ', '') || event.queryStringParameters?.sessionId;

    // Mock user identification - in real app this would validate session
    let userId = null;
    let userEmail = null;

    // Simple session validation - emergency sessions contain user info
    if (sessionId && sessionId.includes('emergency')) {
      // Extract user info from emergency session
      const parts = sessionId.split('_');
      userId = 1; // Default to admin for emergency sessions
      userEmail = 'admin@forexsignals.com';
    } else if (sessionId) {
      // Regular session - default to admin
      userId = 1;
      userEmail = 'admin@forexsignals.com';
    }

    // Return subscription status based on user
    let subscriptionStatus = {
      hasActiveSubscription: false,
      plan: null,
      status: null,
      daysRemaining: 0,
      expiryDate: null
    };

    // Check if this is Almeerah (user with active subscription)
    if (userEmail === 'almeerahlosper@gmail.com' || userId === 3) {
      const expiryDate = new Date('2025-08-28T13:42:41.604Z');
      const now = new Date();
      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      subscriptionStatus = {
        hasActiveSubscription: true,
        plan: {
          id: 2,
          name: "Premium Plan",
          price: "99.99",
          duration: 14
        },
        status: "trial",
        daysRemaining: Math.max(0, daysRemaining),
        expiryDate: expiryDate.toISOString()
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(subscriptionStatus)
    };

  } catch (error) {
    console.error('User subscription status API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        hasActiveSubscription: false,
        plan: null,
        status: null,
        daysRemaining: 0,
        expiryDate: null
      })
    };
  }
};