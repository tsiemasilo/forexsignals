export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('🔍 TEST-DEBUG FULL EVENT:', JSON.stringify(event, null, 2));
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Debug test successful',
      received: {
        path: event.path,
        rawUrl: event.rawUrl,
        method: event.httpMethod,
        headers: event.headers,
        body: event.body,
        queryStringParameters: event.queryStringParameters
      },
      timestamp: new Date().toISOString()
    })
  };
};