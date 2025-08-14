import { neon } from '@neondatabase/serverless';

// Use HTTP connection instead of WebSocket
const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL, {
  useSecureWebSocket: false
});

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 2]; // Get user ID from path
    
    if (req.method === 'PATCH') {
      const body = await req.json();
      const { status } = body;

      // Calculate end date based on status
      let endDate = null;
      if (status === 'active') {
        const now = new Date();
        now.setDate(now.getDate() + 14); // Add 14 days for active subscription
        endDate = now.toISOString();
      }

      // Update user subscription
      await sql`
        UPDATE user_subscriptions 
        SET status = ${status}, end_date = ${endDate}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription updated successfully',
          status,
          endDate 
        }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );

  } catch (error) {
    console.error('Admin subscription error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers }
    );
  }
};