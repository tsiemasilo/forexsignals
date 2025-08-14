import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: DATABASE_URL });

// Direct signals API function with forced database connection
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

  try {
    // Check subscription status first
    const userId = 3; // Default to Almeerah for demo
    
    const result = await pool.query(`
      SELECT s.status, s.end_date
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = $1
    `, [userId]);

    const userRow = result.rows[0];
    
    // Check if user has valid subscription
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

    // Get real signals directly from database - NO FALLBACK
    console.log('Forcing direct database connection for signals...');
    const signalsResult = await pool.query(`
      SELECT id, title, content, trade_action, 
             image_url, image_urls, created_by, is_active, 
             created_at, updated_at
      FROM signals 
      WHERE is_active = true
      ORDER BY created_at DESC
    `);

    console.log(`Direct database query returned ${signalsResult.rows.length} signals`);

    const signals = signalsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.content?.substring(0, 100) + "..." || "",
      content: row.content,
      currencyPair: row.title?.includes('/') ? row.title.split(' ')[0] : row.title,
      signal: row.trade_action?.toUpperCase() || 'BUY',
      tradeAction: row.trade_action?.toUpperCase() || 'BUY',
      entryPrice: "TBD",
      stopLoss: "TBD", 
      takeProfit: "TBD",
      status: row.is_active ? 'active' : 'inactive',
      imageUrls: row.image_urls || (row.image_url ? [row.image_url] : ["/api/placeholder/400/300"]),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    console.log('Signals processed:', signals.map(s => s.title));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(signals)
    };

  } catch (error) {
    console.error('Direct signals API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Database connection failed', 
        error: error.message,
        details: 'Unable to fetch signals from database'
      })
    };
  }
};