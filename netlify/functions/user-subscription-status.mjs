// Shared subscription state (same as in admin function)
let globalSubscriptionState = {
  '1': { status: 'inactive', plan: null, planId: null, expiryDate: null, statusDisplay: 'No Subscription' },
  '2': { status: 'inactive', plan: null, planId: null, expiryDate: null, statusDisplay: 'No Subscription' },
  '3': { status: 'trial', plan: 'Free Trial', planId: null, expiryDate: '2025-08-28T13:42:41.604Z', statusDisplay: 'Free Trial' }
};

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
    
    // Check for admin override parameters (to simulate real-time updates)
    const queryParams = event.queryStringParameters || {};
    if (queryParams.forceStatus) {
      console.log('Admin override detected, status:', queryParams.forceStatus);
      globalSubscriptionState['3'].status = queryParams.forceStatus;
      globalSubscriptionState['3'].statusDisplay = queryParams.forceStatus === 'trial' ? 'Free Trial' :
                                                   queryParams.forceStatus === 'active' ? 'Active' :
                                                   queryParams.forceStatus === 'inactive' ? 'No Subscription' :
                                                   queryParams.forceStatus === 'expired' ? 'Expired' : 'No Subscription';
      if (queryParams.forcePlan) {
        globalSubscriptionState['3'].plan = queryParams.forcePlan;
      }
    }
    
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

    // Get current subscription status from global state
    const userState = globalSubscriptionState[userId.toString()] || globalSubscriptionState['3']; // Default to user 3 for demo
    
    let subscriptionStatus = {
      status: 'inactive',
      statusDisplay: 'No Subscription',
      daysLeft: 0,
      color: 'bg-gray-500 text-white',
      plan: null,
      endDate: null
    };

    // Calculate status based on current user state
    if (userState.status === 'trial') {
      const expiryDate = new Date(userState.expiryDate || '2025-08-28T13:42:41.604Z');
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

      subscriptionStatus = {
        status: 'trial',
        statusDisplay: 'Free Trial',
        daysLeft: daysLeft,
        color: 'bg-yellow-500 text-white',
        plan: { name: userState.plan || 'Free Trial', price: '0.00' },
        endDate: expiryDate.toISOString()
      };
    } else if (userState.status === 'active') {
      const expiryDate = new Date(userState.expiryDate || Date.now() + 14 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

      subscriptionStatus = {
        status: 'active',
        statusDisplay: 'Active',
        daysLeft: daysLeft,
        color: 'bg-green-500 text-white',
        plan: { 
          name: userState.plan || 'Premium Plan', 
          price: userState.planId === 1 ? '49.99' : userState.planId === 3 ? '179.99' : '99.99'
        },
        endDate: expiryDate.toISOString()
      };
    } else if (userState.status === 'expired') {
      subscriptionStatus = {
        status: 'expired',
        statusDisplay: 'Expired',
        daysLeft: 0,
        color: 'bg-red-500 text-white',
        plan: null,
        endDate: null
      };
    } else if (userState.status === 'inactive') {
      subscriptionStatus = {
        status: 'inactive',
        statusDisplay: 'No Subscription',
        daysLeft: 0,
        color: 'bg-gray-500 text-white',
        plan: null,
        endDate: null
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