import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Use NETLIFY_DATABASE_URL_UNPOOLED for better compatibility
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

let pool;
try {
  pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} catch (poolError) {
  console.error('Pool creation failed:', poolError);
}

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('🔧 Starting signals fetch - DATABASE_URL configured:', !!DATABASE_URL);

  try {
    // Check subscription status
    const userId = 3; // Almeerah's user ID
    
    const userResult = await pool.query(`
      SELECT s.status, s.end_date
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = $1
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [userId]);

    console.log('User subscription check:', userResult.rows[0]);

    const userRow = userResult.rows[0];
    const hasValidSubscription = userRow && 
      (userRow.status === 'active' || userRow.status === 'trial');

    if (!hasValidSubscription) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          message: 'Active subscription required',
          status: userRow?.status || 'none'
        })
      };
    }

    // Get all signals from database
    console.log('📊 Fetching signals from database...');
    const signalsQuery = `
      SELECT id, title, content, trade_action, 
             image_url, image_urls, created_by, is_active, 
             created_at, updated_at
      FROM signals 
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    
    console.log('Executing query:', signalsQuery);
    const signalsResult = await pool.query(signalsQuery);
    console.log(`📈 Database returned ${signalsResult.rows.length} signals`);
    
    // Log each signal for debugging
    signalsResult.rows.forEach((row, index) => {
      console.log(`Signal ${index + 1}: ID=${row.id}, Title="${row.title}", Action="${row.trade_action}"`);
    });

    const signals = signalsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: (row.content?.substring(0, 100) || "") + (row.content?.length > 100 ? "..." : ""),
      content: row.content || "",
      currencyPair: row.title?.includes('/') ? row.title.split(' ')[0] : row.title || "Unknown",
      signal: (row.trade_action || 'BUY').toUpperCase(),
      tradeAction: (row.trade_action || 'BUY').toUpperCase(),
      entryPrice: "Entry: TBD",
      stopLoss: "SL: TBD",
      takeProfit: "TP: TBD",
      status: row.is_active ? 'active' : 'inactive',
      imageUrls: row.image_urls || (row.image_url ? [row.image_url] : ["/api/placeholder/400/300"]),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    console.log('✅ Processed signals:', signals.map(s => `"${s.title}"`).join(', '));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(signals)
    };

  } catch (error) {
    console.error('❌ Signals API error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.split('\n')[0]
    });
    
    // Return error details for debugging
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Database connection failed', 
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      })
    };
  }
};