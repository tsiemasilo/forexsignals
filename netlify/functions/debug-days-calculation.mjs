import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function handler(event, context) {
  console.log('🔍 Debug Days Calculation Function Called');
  
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const client = await pool.connect();
    
    // Get all users with subscriptions
    const query = `
      SELECT 
        u.id,
        u.email,
        s.id as subscription_id,
        s.plan_id,
        s.status,
        s.start_date,
        s.end_date,
        p.name as plan_name,
        p.duration,
        p.price,
        EXTRACT(epoch FROM (s.end_date - NOW())) / 86400 as days_remaining_db,
        CASE 
          WHEN s.end_date > NOW() THEN CEIL(EXTRACT(epoch FROM (s.end_date - NOW())) / 86400)
          ELSE 0
        END as days_remaining_calculated
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'trial')
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id IS NOT NULL
      ORDER BY u.id;
    `;

    const result = await client.query(query);
    const users = result.rows;

    // Calculate days for each user using multiple methods
    const debugData = users.map(user => {
      const endDate = new Date(user.end_date);
      const currentDate = new Date();
      
      // Method 1: Simple math calculation
      const method1 = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Method 2: Database calculation (already in query)
      const method2 = Math.max(0, Math.ceil(parseFloat(user.days_remaining_db || 0)));
      
      // Method 3: Using plan duration as baseline
      const startDate = new Date(user.start_date);
      const planDuration = parseInt(user.duration || 0);
      const daysSinceStart = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const method3 = Math.max(0, planDuration - daysSinceStart);

      return {
        userId: user.id,
        email: user.email,
        planName: user.plan_name,
        planDuration: user.duration,
        status: user.status,
        startDate: user.start_date,
        endDate: user.end_date,
        calculations: {
          method1_frontend_math: method1,
          method2_database_extract: method2,
          method3_plan_duration: method3,
          database_calculated: parseInt(user.days_remaining_calculated || 0)
        },
        discrepancies: {
          frontend_vs_db: method1 !== method2,
          frontend_vs_plan: method1 !== method3,
          db_vs_plan: method2 !== method3
        },
        rawData: {
          days_remaining_db: user.days_remaining_db,
          days_remaining_calculated: user.days_remaining_calculated,
          current_timestamp: currentDate.toISOString(),
          end_timestamp: endDate.toISOString()
        }
      };
    });

    client.release();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        totalUsers: users.length,
        debugData,
        serverTime: new Date().toISOString(),
        calculations: {
          note: "Method 1: Frontend Math, Method 2: Database Extract, Method 3: Plan Duration",
          discrepancy_count: debugData.filter(d => d.discrepancies.frontend_vs_db || d.discrepancies.frontend_vs_plan).length
        }
      }, null, 2)
    };

  } catch (error) {
    console.error('Days calculation debug error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}