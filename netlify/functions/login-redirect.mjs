// Simple login redirect for GET requests to /api/login
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: {'Access-Control-Allow-Origin': '*'}, body: '' };
  }

  // Redirect to the auth page for any GET requests to /api/login
  return {
    statusCode: 302,
    headers: {
      'Location': '/auth',
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  };
};