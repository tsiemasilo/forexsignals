import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon("postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const path = event.path;
    const notificationData = JSON.parse(event.body);

    if (path === '/api/ozow/notify' || path.includes('/webhooks')) {
      console.log('Ozow webhook received:', notificationData);
      
      const { TransactionReference, Status, Amount } = notificationData;
      
      if (Status === "Complete") {
        try {
          // Parse transaction reference: WFX-userId-planId-timestamp  
          const parts = TransactionReference.split('-');
          if (parts.length >= 4 && parts[0] === 'WFX') {
            const userId = parseInt(parts[1]);
            const planId = parseInt(parts[2]);
            
            console.log(`Processing Ozow payment: User ${userId}, Plan ${planId}, Amount ${Amount}`);
            
            // Get plan details
            const plan = await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
            
            if (plan.length > 0 && userId) {
              // Create active subscription for the user
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + plan[0].duration);
              
              // Delete any existing subscription for this user
              await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
              
              // Create new active subscription
              await sql`
                INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
                VALUES (${userId}, ${planId}, 'active', ${new Date()}, ${endDate}, ${new Date()})
              `;
              
              console.log(`✅ Ozow payment successful: Created active ${plan[0].name} subscription for user ${userId}`);
            }
          }
        } catch (error) {
          console.error('Error processing Ozow webhook:', error);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: 'OK'
      };
    }

    if (path === '/api/yoco/notify') {
      console.log('Yoco webhook received:', notificationData);
      
      const { type, payload } = notificationData;
      
      if (type === 'payment.succeeded' && payload?.metadata) {
        const { planId } = payload.metadata;
        
        if (planId) {
          console.log(`Yoco payment successful for plan ${planId}`);
          // In a full implementation, you would update user subscription here
        }
      }

      return {
        statusCode: 200,
        headers,
        body: 'OK'
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Webhook endpoint not found' })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Webhook processing failed' })
    };
  }
};