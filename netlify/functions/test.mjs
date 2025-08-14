// Simple test function to verify Netlify function deployment
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Netlify function is working',
      environment: {
        hasNetlifyDb: !!process.env.NETLIFY_DATABASE_URL,
        hasRegularDb: !!process.env.DATABASE_URL,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    })
  };
};