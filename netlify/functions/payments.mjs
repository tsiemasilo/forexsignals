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
    const { planId } = JSON.parse(event.body);

    // Get plan details
    const plan = await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
    if (plan.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Plan not found' })
      };
    }

    const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'https://watchlistfx.netlify.app';

    if (path === '/api/yoco/payment') {
      // Yoco payment URLs (predefined checkout links)
      const checkoutUrls = {
        1: "https://c.yoco.com/checkout/ch_PLmQ2BJ7wp8h3Qu4Z9F1l6Lm", // Basic Plan
        2: "https://c.yoco.com/checkout/ch_QLOBkND8RDvfb3Vh207tyk0x", // Premium Plan
        3: "https://pay.yoco.com/r/mEQXAD" // VIP Plan
      };

      const redirectUrl = checkoutUrls[planId];
      if (!redirectUrl) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid plan selected' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ redirectUrl })
      };
    }

    if (path === '/api/ozow/payment') {
      const privateKey = process.env.OZOW_SECRET_KEY;
      if (!privateKey) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Ozow not configured' })
        };
      }

      // Ozow payment parameters
      const ozowParams = {
        SiteCode: "NOS-NOS-005",
        CountryCode: "ZA", 
        CurrencyCode: "ZAR",
        Amount: parseFloat(plan[0].price).toFixed(2),
        TransactionReference: `WFX-${Date.now()}-${planId}`,
        BankReference: "WatchlistFx Payment",
        Customer: "customer@example.com",
        IsTest: "false",
        SuccessUrl: `${origin}/payment-success`,
        CancelUrl: `${origin}/payment-cancel`,
        ErrorUrl: `${origin}/payment-error`, 
        NotifyUrl: `${origin}/api/ozow/notify`
      };

      // Ruby implementation hash order (compact_blank removes empty optionals)
      const hashParams = [
        ozowParams.SiteCode,
        ozowParams.CountryCode,
        ozowParams.CurrencyCode,
        ozowParams.Amount,
        ozowParams.TransactionReference,
        ozowParams.BankReference,
        ozowParams.Customer,
        ozowParams.CancelUrl,
        ozowParams.ErrorUrl,
        ozowParams.SuccessUrl,
        ozowParams.NotifyUrl,
        ozowParams.IsTest,
        privateKey
      ];
      
      const hashString = hashParams.join('').toLowerCase();
      const hashCheck = crypto.createHash('sha512').update(hashString).digest('hex');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          action_url: "https://pay.ozow.com",
          ...ozowParams,
          HashCheck: hashCheck
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Payment method not found' })
    };

  } catch (error) {
    console.error('Payment error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Payment processing failed' })
    };
  }
};