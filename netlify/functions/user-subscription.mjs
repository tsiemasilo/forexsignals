// User subscription API function
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

  try {
    // Extract user ID from path
    const pathParts = event.path.split('/');
    const userId = pathParts[pathParts.indexOf('users') + 1];

    // Mock subscription data based on user ID
    let subscription = null;
    
    if (userId === '3') {
      // Almeerah's active subscription
      subscription = {
        id: 1,
        userId: 3,
        planId: 2,
        status: "trial",
        startDate: "2025-08-14T13:42:41.604Z",
        endDate: "2025-08-28T13:42:41.604Z",
        createdAt: "2025-08-14T13:42:41.604Z",
        updatedAt: "2025-08-14T13:42:41.604Z",
        plan: {
          id: 2,
          name: "Premium Plan",
          price: "99.99",
          duration: 14
        }
      };
    }

    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(subscription)
      };
    }

    if (event.httpMethod === 'PUT') {
      // Handle subscription updates
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

      if (subscription && body.status) {
        subscription.status = body.status;
        subscription.updatedAt = new Date().toISOString();
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Subscription updated successfully',
          subscription
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('User subscription API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};