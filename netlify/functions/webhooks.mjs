import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

let sql;
try {
  sql = neon(databaseUrl);
} catch (error) {
  console.error('Database connection error:', error);
}

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

    if (path === '/api/ozow/notify') {
      console.log('Ozow webhook received:', notificationData);
      
      const { TransactionReference, Status } = notificationData;
      
      if (Status === "Complete") {
        // Parse transaction reference: WFX-timestamp-planId
        const parts = TransactionReference.split('-');
        const planId = parseInt(parts[2]);
        
        if (planId) {
          // Get plan details
          const plan = await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
          
          if (plan.length > 0) {
            console.log(`Ozow payment successful for plan ${planId}`);
            // In a full implementation, you would update user subscription here
            // For now, just log the successful payment
          }
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