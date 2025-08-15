import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
  console.log('🎯 NETLIFY DEDICATED TRIAL CREATION: Starting', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://watchlistfx.netlify.app',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    // Extract userId from URL path
    const urlParts = req.url.split('/');
    const userIdIndex = urlParts.findIndex(part => part === 'users') + 1;
    const userId = parseInt(urlParts[userIdIndex]);

    if (!userId || isNaN(userId)) {
      console.log('❌ NETLIFY TRIAL: Invalid user ID');
      return new Response(JSON.stringify({ message: 'Invalid user ID' }), {
        status: 400,
        headers
      });
    }

    console.log('🎯 NETLIFY TRIAL: Creating fresh 7-day trial for user:', userId);

    // Create start and end dates for the trial
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7); // Exactly 7 days from now

    // Remove any existing subscription for this user first
    await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
    console.log('🗑️ NETLIFY TRIAL: Removed existing subscription for user:', userId);

    // Create fresh trial subscription
    const newSubscription = await sql`
      INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
      VALUES (${userId}, 1, 'trial', ${now.toISOString()}, ${endDate.toISOString()}, ${now.toISOString()})
      RETURNING *
    `;

    const subscription = newSubscription[0];
    
    console.log('✅ NETLIFY TRIAL: Fresh trial created:', {
      ...subscription,
      durationDays: Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    });

    return new Response(JSON.stringify({
      message: 'Fresh 7-day trial created successfully',
      subscription: subscription,
      durationDays: 7
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ NETLIFY TRIAL: Error creating fresh trial:', error);
    return new Response(JSON.stringify({
      message: 'Failed to create fresh trial',
      error: error.message
    }), {
      status: 500,
      headers
    });
  }
};

export const config = {
  path: "/api/admin/users/*/create-trial"
};