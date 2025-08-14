import { neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for Netlify serverless - disable WebSocket for HTTP pooling
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000
});

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Creating sessions table for Netlify functions...');
    
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `;

    await pool.query(createSessionsTable);
    console.log('Sessions table created successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Sessions table created successfully',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error creating sessions table:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Failed to create sessions table',
        error: error.message 
      })
    };
  }
};