import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

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
    if (event.httpMethod === 'GET') {
      // Get all subscription plans
      const plans = await sql`
        SELECT id, name, price, duration, description, created_at
        FROM subscription_plans 
        ORDER BY price ASC
      `;

      // Format plans to match frontend expectations
      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: parseFloat(plan.price),
        duration: plan.duration,
        description: plan.description,
        createdAt: plan.created_at
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedPlans)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Not found" })
    };

  } catch (error) {
    console.error('Plans error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
};