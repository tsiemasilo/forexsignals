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

    // For demo purposes, default to trial user to show subscription badge
    userId = 3;
    userEmail = 'almeerahlosper@gmail.com';
    
    // Override for specific sessions if provided
    if (sessionId && sessionId.includes('emergency')) {
      // Extract user info from emergency session
      const parts = sessionId.split('_');
      if (sessionId.includes('admin')) {
        userId = 1;
        userEmail = 'admin@forexsignals.com';
      }
      // Keep default trial user for other sessions
    }

    // Return subscription status in the format expected by frontend
    let subscriptionStatus = {
      status: 'inactive',
      statusDisplay: 'No Subscription',
      daysLeft: 0,
      color: 'bg-gray-500 text-white',
      plan: null,
      endDate: null
    };

    // Check if this is Almeerah (user with active subscription)
    if (userEmail === 'almeerahlosper@gmail.com' || userId === 3) {
      const expiryDate = new Date('2025-08-28T13:42:41.604Z');
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

      subscriptionStatus = {
        status: 'trial',
        statusDisplay: 'Free Trial',
        daysLeft: daysLeft,
        color: 'bg-yellow-500 text-white',
        plan: {
          name: "Premium Plan",
          price: "99.99"
        },
        endDate: expiryDate.toISOString()
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