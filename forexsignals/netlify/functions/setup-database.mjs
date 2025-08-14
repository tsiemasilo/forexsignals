import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL;
const pool = new Pool({ connectionString: DATABASE_URL });

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
    console.log('Setting up missing signals table...');

    // Create signals table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS signals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        trade_action VARCHAR(10) DEFAULT 'Buy',
        image_url TEXT,
        image_urls JSON,
        created_by INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Signals table created successfully');

    // Check if we have any signals
    const existingSignals = await pool.query('SELECT COUNT(*) FROM signals');
    const signalCount = parseInt(existingSignals.rows[0].count);

    if (signalCount === 0) {
      console.log('Seeding signals table with current data...');
      
      // Insert the current signals including NAS100
      await pool.query(`
        INSERT INTO signals (id, title, content, trade_action, image_url, created_by, is_active, created_at) VALUES
        (1, 'EUR/USD Buy Signal', 'Strong bullish momentum on EUR/USD. Entry at 1.0850, Stop Loss at 1.0820, Take Profit at 1.0920. Risk-reward ratio 1:2.3', 'Buy', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200', 1, true, '2025-08-13 13:42:42'),
        (2, 'GBP/JPY Sell Signal', 'Bearish reversal pattern confirmed on GBP/JPY. Entry at 165.50, Stop Loss at 166.00, Take Profit at 164.50. Watch for break below support.', 'Sell', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200', 1, true, '2025-08-13 13:42:42'),
        (3, 'USD/CHF Hold Position', 'Sideways consolidation on USD/CHF. Wait for clear breakout above 0.9200 or below 0.9100 before entering new positions.', 'Hold', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200', 1, true, '2025-08-13 13:42:42'),
        (4, 'nas100', 'Entry:\nSL:\nTP:', 'Buy', '', 1, true, '2025-08-14 08:33:08')
        ON CONFLICT (id) DO NOTHING
      `);

      // Update sequence to continue from 4
      await pool.query(`SELECT setval('signals_id_seq', 4, true)`);
      
      console.log('Signals table seeded with NAS100 signal');
    }

    // Verify signals are there
    const finalCheck = await pool.query('SELECT id, title, trade_action FROM signals ORDER BY created_at');
    console.log('Current signals in database:', finalCheck.rows);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Database setup completed successfully',
        signalsCount: finalCheck.rows.length,
        signals: finalCheck.rows
      })
    };

  } catch (error) {
    console.error('Database setup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Database setup failed',
        error: error.message
      })
    };
  }
};