import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('NETLIFY_DATABASE_URL or DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🔍 ADMIN DEBUG: Starting comprehensive database analysis...');
    
    // Get all users from database
    const allUsers = await sql`
      SELECT id, email, first_name, last_name, is_admin, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    console.log('📊 ALL USERS IN DATABASE:', allUsers);
    
    // Get all subscriptions
    const allSubscriptions = await sql`
      SELECT s.*, sp.name as plan_name, sp.duration, sp.price
      FROM subscriptions s
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `;
    
    console.log('📊 ALL SUBSCRIPTIONS:', allSubscriptions);
    
    // Get the query that admin-fixed.mjs uses
    const adminQueryResult = await sql`
      SELECT u.*, s.*, sp.name as plan_name, sp.duration as plan_duration, sp.price as plan_price
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE u.is_admin = false
      ORDER BY u.id, s.created_at DESC
    `;
    
    console.log('📊 ADMIN QUERY RESULT:', adminQueryResult);
    
    // Check for user 'ae' specifically
    const userAe = await sql`
      SELECT * FROM users WHERE email ILIKE '%ae%' OR first_name ILIKE '%ae%' OR last_name ILIKE '%ae%'
    `;
    
    console.log('🔍 USER AE SEARCH:', userAe);
    
    // Recent registrations
    const recentUsers = await sql`
      SELECT * FROM users 
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
    `;
    
    console.log('🕐 RECENT USERS (last hour):', recentUsers);
    
    const debugInfo = {
      databaseUrl: DATABASE_URL.replace(/:[^:@]*@/, ':***@'),
      totalUsers: allUsers.length,
      totalSubscriptions: allSubscriptions.length,
      adminQueryCount: adminQueryResult.length,
      userAeFound: userAe.length > 0,
      recentUsers: recentUsers.length,
      allUsers: allUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        isAdmin: u.is_admin,
        createdAt: u.created_at
      })),
      adminQueryUsers: adminQueryResult.map(u => ({
        id: u.id,
        email: u.email,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        hasSubscription: !!u.plan_id
      })),
      userAeDetails: userAe,
      recentUserDetails: recentUsers
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(debugInfo, null, 2)
    };
    
  } catch (error) {
    console.error('❌ ADMIN DEBUG ERROR:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        databaseUrl: DATABASE_URL.replace(/:[^:@]*@/, ':***@')
      })
    };
  }
};