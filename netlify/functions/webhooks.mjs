import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    console.log('🔔 WEBHOOK REQUEST:', { path, method });

    // Yoco Webhook
    if (path === '/api/yoco/notify' && method === 'POST') {
      const webhookData = JSON.parse(event.body || '{}');
      console.log('💳 Yoco webhook received:', webhookData);

      // Process Yoco payment success
      if (webhookData.type === 'payment.succeeded') {
        const { metadata } = webhookData.payload;
        const planId = parseInt(metadata?.plan_id);
        const userEmail = metadata?.user_email;

        if (planId && userEmail) {
          // Find user
          const users = await sql`SELECT id FROM users WHERE email = ${userEmail}`;
          
          if (users.length > 0) {
            const userId = users[0].id;
            
            // Get plan details
            const plans = await sql`SELECT duration FROM subscription_plans WHERE id = ${planId}`;
            const duration = plans[0]?.duration || 5;
            
            // Create subscription
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);
            
            // Remove existing subscription
            await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
            
            // Create new subscription
            await sql`
              INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
              VALUES (${userId}, ${planId}, 'active', NOW(), ${endDate.toISOString()}, NOW())
            `;
            
            console.log('✅ Yoco payment processed successfully for user:', userId);
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Webhook processed" })
      };
    }

    // Ozow Webhook
    if (path === '/api/ozow/notify' && method === 'POST') {
      const formData = new URLSearchParams(event.body || '');
      const webhookData = Object.fromEntries(formData.entries());
      
      console.log('💰 Ozow webhook received:', webhookData);

      // Verify Ozow webhook (if secret key available)
      const ozowSecret = process.env.OZOW_SECRET_KEY;
      if (ozowSecret && webhookData.HashCheck) {
        // Verify hash for security
        const dataToHash = `${webhookData.SiteCode}${webhookData.TransactionId}${webhookData.TransactionReference}${webhookData.Amount}${webhookData.Status}${webhookData.Optional1}${webhookData.Optional2}${webhookData.Optional3}${webhookData.Optional4}${webhookData.Optional5}${webhookData.CurrencyCode}${webhookData.IsTest}${ozowSecret}`;
        const hash = crypto.createHash('sha512').update(dataToHash, 'utf8').digest('hex');
        
        if (hash.toLowerCase() !== webhookData.HashCheck.toLowerCase()) {
          console.log('❌ Ozow webhook hash verification failed');
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: "Invalid hash" })
          };
        }
      }

      // Process payment if successful
      if (webhookData.Status === 'Complete' || webhookData.Status === 'CompleteExternal') {
        const planId = parseInt(webhookData.Optional1);
        const userEmail = webhookData.Optional2;

        if (planId && userEmail) {
          // Find user
          const users = await sql`SELECT id FROM users WHERE email = ${userEmail}`;
          
          if (users.length > 0) {
            const userId = users[0].id;
            
            // Get plan details  
            const plans = await sql`SELECT duration FROM subscription_plans WHERE id = ${planId}`;
            const duration = plans[0]?.duration || 5;
            
            // Create subscription
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);
            
            // Remove existing subscription
            await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
            
            // Create new subscription
            await sql`
              INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
              VALUES (${userId}, ${planId}, 'active', NOW(), ${endDate.toISOString()}, NOW())
            `;
            
            console.log('✅ Ozow payment processed successfully for user:', userId);
          }
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Webhook processed" })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Webhook endpoint not found" })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};