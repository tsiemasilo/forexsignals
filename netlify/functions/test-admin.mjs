// Simple test endpoint to verify admin function routing
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('🧪 TEST ADMIN FUNCTION CALLED:', {
    method: event.httpMethod,
    path: event.path,
    body: event.body,
    timestamp: new Date().toISOString()
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Test admin function working',
      method: event.httpMethod,
      path: event.path,
      timestamp: new Date().toISOString()
    })
  };
};