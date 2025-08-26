import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

// Helper function to get user from session cookie
const getUserFromSession = async (event) => {
  const cookies = event.headers.cookie || '';
  const sessionMatch = cookies.match(/sessionId=([^;]+)/);
  
  if (!sessionMatch) {
    return null;
  }
  
  const userId = parseInt(sessionMatch[1]);
  if (isNaN(userId)) {
    return null;
  }
  
  const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
  return users[0] || null;
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Get user subscription status
    if (event.path === '/api/user/subscription-status' && event.httpMethod === 'GET') {
      const user = await getUserFromSession(event);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: "Authentication required" })
        };
      }

      console.log('🔍 SUBSCRIPTION STATUS DEBUG - User:', user.id);

      // Get user's latest subscription
      const subscriptions = await sql`
        SELECT s.*, sp.name as plan_name, sp.duration, sp.price 
        FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = ${user.id}
        ORDER BY s.created_at DESC
        LIMIT 1
      `;

      if (subscriptions.length === 0) {
        console.log('📋 No subscription found for user:', user.id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              isAdmin: user.is_admin
            },
            subscription: null,
            status: 'no_subscription'
          })
        };
      }

      const subscription = subscriptions[0];
      console.log('📋 Subscription found:', {
        id: subscription.id,
        userId: subscription.user_id,
        planId: subscription.plan_id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        createdAt: subscription.created_at
      });

      // Calculate days remaining
      const now = new Date();
      const endDate = new Date(subscription.end_date);
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Determine if subscription is active
      const validStatuses = ['active', 'trial', 'free trial', 'basic plan', 'premium plan', 'vip plan'];
      const isActive = daysLeft > 0 && validStatuses.includes(subscription.status);

      // Create clean status display and override status if expired
      let statusDisplay = subscription.status;
      let actualStatus = subscription.status;
      
      if (!isActive || daysLeft <= 0) {
        statusDisplay = 'Expired';
        actualStatus = 'expired';
      } else if (subscription.status === 'basic plan') {
        statusDisplay = 'Basic Plan';
      } else if (subscription.status === 'premium plan') {
        statusDisplay = 'Premium Plan';
      } else if (subscription.status === 'vip plan') {
        statusDisplay = 'VIP Plan';
      } else if (subscription.status === 'free trial' || subscription.status === 'trial') {
        statusDisplay = 'Trial';
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
          },
          subscription: {
            id: subscription.id,
            planId: subscription.plan_id,
            planName: subscription.plan_name,
            status: subscription.status,
            startDate: subscription.start_date,
            endDate: subscription.end_date,
            daysLeft: daysLeft,
            isActive: isActive,
            price: parseFloat(subscription.price),
            duration: subscription.duration
          },
          status: actualStatus, // Use calculated status (expired if no days left)
          statusDisplay: statusDisplay, // Formatted display text
          daysLeft: daysLeft,
          color: isActive ? 'green' : 'red'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found" })
    };

  } catch (error) {
    console.error('User error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};