import { neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = globalThis.WebSocket;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // For demo/emergency access - return signals without strict auth
    if (event.httpMethod === 'GET') {
      const signalsQuery = `
        SELECT id, title, content, currency_pair, signal_type, entry_price, 
               stop_loss, take_profit, status, created_at, updated_at
        FROM signals 
        WHERE status = 'active'
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(signalsQuery);
      
      const formattedSignals = result.rows.map(signal => ({
        id: signal.id,
        title: signal.title,
        content: signal.content,
        currencyPair: signal.currency_pair,
        signal: signal.signal_type,
        tradeAction: signal.signal_type,
        entryPrice: signal.entry_price,
        stopLoss: signal.stop_loss,
        takeProfit: signal.take_profit,
        status: signal.status,
        imageUrls: ["/api/placeholder/400/300"],
        createdAt: signal.created_at,
        updatedAt: signal.updated_at
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSignals)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Signals error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};