// Plans API function
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
    // Return the subscription plans from your database
    const plans = [
      {
        id: 1,
        name: "Basic Plan",
        description: "One quality signal per day + market analysis",
        price: "49.99",
        duration: 5,
        createdAt: "2025-08-13T13:42:41.329Z"
      },
      {
        id: 2,
        name: "Premium Plan", 
        description: "One quality signal per day + market analysis",
        price: "99.99",
        duration: 14,
        createdAt: "2025-08-13T13:42:41.464Z"
      },
      {
        id: 3,
        name: "VIP Plan",
        description: "One quality signal per day + market analysis", 
        price: "179.99",
        duration: 30,
        createdAt: "2025-08-13T13:42:41.604Z"
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(plans)
    };
  } catch (error) {
    console.error('Plans API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};