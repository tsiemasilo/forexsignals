// Global subscription state for demo purposes (in a real app this would be in database)
let globalSubscriptionState = {
  '1': { status: 'inactive', plan: null, planId: null, expiryDate: null, statusDisplay: 'No Subscription' },
  '2': { status: 'inactive', plan: null, planId: null, expiryDate: null, statusDisplay: 'No Subscription' },
  '3': { status: 'trial', plan: 'Free Trial', planId: null, expiryDate: '2025-08-28T13:42:41.604Z', statusDisplay: 'Free Trial' }
};

// Admin user subscription management API function
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
    // Extract user ID from path
    const pathParts = event.path.split('/');
    const userIdIndex = pathParts.findIndex(part => part === 'users') + 1;
    const userId = pathParts[userIdIndex];

    console.log('Admin subscription update for user:', userId);
    console.log('Method:', event.httpMethod);
    console.log('Body:', event.body);

    if (event.httpMethod === 'PUT' || event.httpMethod === 'PATCH') {
      // Update user subscription status
      const body = JSON.parse(event.body || '{}');
      const { status, planId } = body;

      console.log('Updating subscription status to:', status);
      console.log('Plan ID:', planId);

      // In a real app, this would update the database
      // For demo purposes, we'll return success with updated status
      let planName = null;
      let statusDisplay = status;
      
      if (status === 'trial') {
        planName = 'Free Trial';
        statusDisplay = 'Free Trial';
      } else if (status === 'active' && planId) {
        const plans = { 1: 'Basic Plan', 2: 'Premium Plan', 3: 'VIP Plan' };
        planName = plans[planId] || 'Premium Plan';
        statusDisplay = 'Active';
      } else if (status === 'active') {
        planName = 'Premium Plan';
        statusDisplay = 'Active';
      } else if (status === 'inactive') {
        statusDisplay = 'Inactive';
      } else if (status === 'expired') {
        statusDisplay = 'Expired';
      }

      // Update global state
      globalSubscriptionState[userId] = {
        status: status,
        statusDisplay: statusDisplay,
        plan: planName,
        planId: planId || null,
        expiryDate: status === 'trial' || status === 'active' ? 
                   new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : 
                   null
      };

      const updatedUser = {
        id: parseInt(userId),
        email: userId === '3' ? 'almeerahlosper@gmail.com' : 
               userId === '2' ? 'tsiemasilo@gmail.com' : 'admin@forexsignals.com',
        subscription: globalSubscriptionState[userId]
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedUser)
      };
    }

    if (event.httpMethod === 'GET') {
      // Get user subscription info
      const user = {
        id: parseInt(userId),
        email: userId === '3' ? 'almeerahlosper@gmail.com' : 
               userId === '2' ? 'tsiemasilo@gmail.com' : 'admin@forexsignals.com',
        subscription: {
          status: userId === '3' ? 'trial' : 'inactive',
          plan: userId === '3' ? 'Free Trial' : null,
          expiryDate: userId === '3' ? '2025-08-28T13:42:41.604Z' : null
        }
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error in admin user subscription:', error);
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