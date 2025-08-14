// Admin Users API function
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
    // Return users with subscription data from your database
    const users = [
      {
        id: 1,
        email: "admin@forexsignals.com",
        firstName: "Admin",
        lastName: "User",
        createdAt: "2025-08-13T13:42:41.194Z",
        updatedAt: "2025-08-13T13:42:41.194Z",
        subscription: null
      },
      {
        id: 2,
        email: "tsiemasilo@gmail.com", 
        firstName: "Tsie",
        lastName: "Masilo",
        createdAt: "2025-08-13T13:42:41.329Z",
        updatedAt: "2025-08-13T13:42:41.329Z",
        subscription: null
      },
      {
        id: 3,
        email: "almeerahlosper@gmail.com",
        firstName: "Almeerah", 
        lastName: "Losper",
        createdAt: "2025-08-13T13:42:41.464Z",
        updatedAt: "2025-08-13T13:42:41.464Z",
        subscription: {
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
        }
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(users)
    };
  } catch (error) {
    console.error('Admin Users API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};