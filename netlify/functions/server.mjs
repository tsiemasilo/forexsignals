import serverless from 'serverless-http';
import express from 'express';

// Try to import registerRoutes with fallback
let registerRoutes;
try {
  const routesModule = await import('../../dist/server/routes.js');
  registerRoutes = routesModule.registerRoutes;
} catch (error) {
  console.error('Failed to import routes:', error);
  // Create a minimal fallback
  registerRoutes = async (app) => {
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Fallback route working', error: 'Main routes failed to load' });
    });
  };
}

async function createApp() {
  try {
    console.log('Creating Netlify function app...');
    
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Debug environment variables
    console.log('Environment check:', {
      hasNetlifyDb: !!process.env.NETLIFY_DATABASE_URL,
      hasRegularDb: !!process.env.DATABASE_URL,
      hasOzowSite: !!process.env.OZOW_SITE_CODE,
      hasOzowKey: !!process.env.OZOW_PRIVATE_KEY
    });
    
    // Register all API routes
    await registerRoutes(app);
    
    console.log('App created successfully');
    return app;
  } catch (error) {
    console.error('Error creating app:', error);
    throw error;
  }
}

// Create the serverless handler
export const handler = async (event, context) => {
  try {
    console.log('Netlify function invoked:', event.path);
    
    const app = await createApp();
    const serverlessHandler = serverless(app);
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Netlify function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};