// Debug function to check what's available in the Netlify environment
export const handler = async (event, context) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Check if dist folder exists and what's in it
    let distContents = 'Not found';
    try {
      distContents = fs.readdirSync('../../dist', { recursive: true });
    } catch (e) {
      distContents = `Error reading dist: ${e.message}`;
    }
    
    // Check if server files exist
    let serverExists = false;
    try {
      await import('../../dist/server/routes.js');
      serverExists = true;
    } catch (e) {
      serverExists = `Import failed: ${e.message}`;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Debug info',
        environment: {
          hasNetlifyDb: !!process.env.NETLIFY_DATABASE_URL,
          hasRegularDb: !!process.env.DATABASE_URL,
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
          cwd: process.cwd(),
          distContents: Array.isArray(distContents) ? distContents.slice(0, 20) : distContents,
          serverExists
        }
      }, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};