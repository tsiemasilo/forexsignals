import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    console.log('💳 PAYMENT REQUEST:', { path, method });

    // YOCO Payment
    if (path === '/api/yoco/payment' && method === 'POST') {
      const { planId, userEmail, amount } = JSON.parse(event.body || '{}');
      
      // Get plan details
      const plans = await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
      
      if (plans.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid plan" })
        };
      }

      const plan = plans[0];
      
      // Create Yoco checkout URL
      const checkoutUrl = `https://yoco.com/checkout?amount=${amount * 100}&currency=ZAR&description=${encodeURIComponent(plan.name)}&metadata[plan_id]=${planId}&metadata[user_email]=${encodeURIComponent(userEmail)}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          checkoutUrl,
          message: "Redirect to Yoco payment page"
        })
      };
    }

    // OZOW Payment 
    if (path === '/api/ozow/payment' && method === 'POST') {
      const { planId, userEmail, amount, firstName, lastName } = JSON.parse(event.body || '{}');
      
      // Get plan details
      const plans = await sql`SELECT * FROM subscription_plans WHERE id = ${planId}`;
      
      if (plans.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid plan" })
        };
      }

      const plan = plans[0];
      
      // Create Ozow payment data
      const siteCode = "NOS-NOS-005"; // Your specified site code
      const transactionReference = `WFX-${Date.now()}-${planId}`;
      
      const paymentData = {
        siteCode,
        countryCode: "ZA",
        currencyCode: "ZAR",
        amount: amount,
        transactionReference,
        bankReference: plan.name,
        successUrl: `${event.headers.origin || 'https://watchlistfx.netlify.app'}/payment-success`,
        cancelUrl: `${event.headers.origin || 'https://watchlistfx.netlify.app'}/payment-cancel`,
        errorUrl: `${event.headers.origin || 'https://watchlistfx.netlify.app'}/payment-error`,
        notifyUrl: `${event.headers.origin || 'https://watchlistfx.netlify.app'}/api/ozow/notify`,
        customer: userEmail,
        optional1: planId.toString(),
        optional2: userEmail,
        optional3: `${firstName} ${lastName}`,
        optional4: "",
        optional5: ""
      };

      // Create Ozow checkout URL
      const baseUrl = "https://pay.ozow.com/";
      const queryParams = new URLSearchParams(paymentData).toString();
      const checkoutUrl = `${baseUrl}?${queryParams}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          checkoutUrl,
          transactionReference,
          message: "Redirect to Ozow payment page"
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Payment method not found" })
    };

  } catch (error) {
    console.error('Payment error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};