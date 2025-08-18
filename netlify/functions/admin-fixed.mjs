import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
console.log('🔍 DATABASE_URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Hide password in logs

const sql = neon(DATABASE_URL);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Cache-Invalidation': 'forced',
    'X-Real-Time-Update': new Date().toISOString()
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path || event.rawUrl || '';
    const method = event.httpMethod;
    
    console.log('🔍 ADMIN-FIXED REQUEST:', { path, method, rawUrl: event.rawUrl });
    console.log('🔍 FULL EVENT DEBUG:', {
      path: event.path,
      rawUrl: event.rawUrl,
      httpMethod: event.httpMethod,
      queryStringParameters: event.queryStringParameters,
      headers: event.headers,
      body: event.body,
      isBase64Encoded: event.isBase64Encoded
    });

    // GET all users with subscriptions
    if (method === 'GET' && (path.includes('/users') || path === '/api/admin/users')) {
      console.log('🔍 ADMIN: Fetching all users with subscriptions...');
      
      // First get all non-admin users
      const allUsers = await sql`
        SELECT id, email, first_name, last_name, is_admin, created_at
        FROM users 
        WHERE is_admin = false
        ORDER BY created_at DESC
      `;
      
      console.log('📊 ALL NON-ADMIN USERS:', allUsers);
      
      // Then get their latest subscriptions
      const usersWithSubscriptions = await sql`
        SELECT DISTINCT ON (u.id) 
               u.id, u.email, u.first_name, u.last_name, u.is_admin, u.created_at,
               s.id as subscription_id, s.plan_id, s.status, s.start_date, s.end_date, s.created_at as sub_created,
               sp.name as plan_name, sp.duration as plan_duration, sp.price as plan_price
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.is_admin = false
        ORDER BY u.id, s.created_at DESC NULLS LAST
      `;

      console.log('📊 USERS WITH SUBSCRIPTIONS:', usersWithSubscriptions);

      const result = usersWithSubscriptions.map(row => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        isAdmin: row.is_admin,
        createdAt: row.created_at,
        subscription: row.subscription_id ? {
          id: row.subscription_id,
          planId: row.plan_id,
          status: row.status,
          startDate: row.start_date,
          endDate: row.end_date,
          planName: row.plan_name,
          duration: row.plan_duration,
          price: row.plan_price
        } : null
      }));
      
      console.log('📊 FINAL RESULT:', result);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // Extract user ID from path - handle multiple patterns
    let userId = null;
    const pathSegments = path.split('/');
    console.log('🔍 PATH SEGMENTS:', pathSegments);
    
    for (let i = 0; i < pathSegments.length; i++) {
      if (pathSegments[i] === 'users' && pathSegments[i + 1]) {
        const potentialUserId = parseInt(pathSegments[i + 1]);
        if (!isNaN(potentialUserId)) {
          userId = potentialUserId;
          break;
        }
      }
    }

    console.log('🔍 EXTRACTED USER ID:', userId);

    // CREATE TRIAL - POST request with create-trial in path
    if (method === 'POST' && path.includes('create-trial') && userId) {
      console.log('🎯 CREATE TRIAL REQUEST for user:', userId);
      
      // Create 7-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      console.log('📅 TRIAL END DATE:', endDate.toISOString());

      // Remove existing subscription
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      // Validate user exists first
      console.log('🔍 Checking if user exists:', userId);
      const userExists = await sql`SELECT id FROM users WHERE id = ${userId}`;
      console.log('🔍 User query result:', userExists);
      
      if (userExists.length === 0) {
        console.log('❌ User does not exist:', userId);
        
        // Also check what users DO exist for debugging
        const allUsers = await sql`SELECT id, email FROM users LIMIT 10`;
        console.log('🔍 All users in database:', allUsers);
        
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'User not found', 
            userId, 
            debug: { 
              availableUsers: allUsers.map(u => u.id),
              databaseUrl: DATABASE_URL.replace(/:[^:@]*@/, ':***@')
            }
          })
        };
      }

      // Create trial subscription
      const result = await sql`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
        VALUES (${userId}, 1, 'trial', NOW(), ${endDate.toISOString()}, NOW())
        RETURNING *
      `;

      console.log('🎉 Trial created successfully:', result[0]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, subscription: result[0] })
      };
    }

    // UPDATE SUBSCRIPTION - PUT request with subscription in path
    if (method === 'PUT' && path.includes('subscription') && userId) {
      console.log('🔧 UPDATE SUBSCRIPTION REQUEST for user:', userId);
      console.log('🔧 RAW EVENT BODY:', event.body);
      console.log('🔧 FULL REQUEST CONTEXT:', {
        method,
        path,
        userId,
        headers: event.headers,
        contentType: event.headers['content-type'],
        bodyIsBase64: event.isBase64Encoded
      });
      
      let requestData = {};
      try {
        requestData = JSON.parse(event.body || '{}');
        console.log('🔧 PARSED REQUEST DATA:', requestData);
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError);
        console.error('❌ RAW BODY CAUSING ERROR:', event.body);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'Invalid JSON in request body',
            error: parseError.message,
            rawBody: event.body,
            contentType: event.headers['content-type']
          })
        };
      }

      const { planId, status, endDate } = requestData;
      console.log('📋 EXTRACTED DATA:', { userId, planId, status, endDate, planIdType: typeof planId, statusType: typeof status });

      // Enhanced validation
      if (!status) {
        console.error('❌ STATUS MISSING from request');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'Status is required',
            receivedData: requestData,
            expectedFields: ['status', 'planId (optional)']
          })
        };
      }

      // Validate status values
      const validStatuses = ['active', 'inactive', 'expired', 'trial'];
      if (!validStatuses.includes(status)) {
        console.error('❌ INVALID STATUS VALUE:', status);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'Invalid status value',
            received: status,
            validOptions: validStatuses
          })
        };
      }

      // Validate user exists first with enhanced debugging
      console.log('🔍 VALIDATING USER EXISTS:', userId);
      const userExists = await sql`SELECT id, email FROM users WHERE id = ${userId}`;
      console.log('🔍 USER VALIDATION RESULT:', userExists);
      
      if (userExists.length === 0) {
        console.log('❌ USER NOT FOUND:', userId);
        
        // Show available users for debugging
        const availableUsers = await sql`SELECT id, email FROM users WHERE is_admin = false LIMIT 15`;
        console.log('🔍 AVAILABLE USERS:', availableUsers);
        
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            message: `User with ID ${userId} not found in database`, 
            userId,
            availableUserIds: availableUsers.map(u => u.id),
            totalAvailableUsers: availableUsers.length,
            suggestion: 'Please use one of the available user IDs listed above'
          })
        };
      }

      console.log('✅ USER VALIDATED:', userExists[0]);

      try {
        console.log('🛠️ PROCESSING SUBSCRIPTION UPDATE:', { status, planId, userId });

        // Handle different subscription status changes
        if (status === 'expired') {
          console.log('⏰ Setting subscription to EXPIRED for user:', userId);
          
          const expiredDate = new Date();
          expiredDate.setDate(expiredDate.getDate() - 1);
          
          console.log('🗑️ Deleting existing subscriptions...');
          await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
          
          console.log('📝 Creating expired subscription...');
          const result = await sql`
            INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
            VALUES (${userId}, 1, 'expired', ${expiredDate.toISOString()}, ${expiredDate.toISOString()}, NOW())
            RETURNING *
          `;
          
          console.log('✅ EXPIRED SUBSCRIPTION CREATED:', result[0]);
          return {
            statusCode: 200,
            headers: { ...headers, 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ success: true, subscription: result[0] })
          };
          
        } else if (status === 'active') {
          console.log('🟢 Setting subscription to ACTIVE for user:', userId, 'with plan:', planId);
          
          // Validate planId is provided for active subscriptions
          if (!planId) {
            console.error('❌ PLAN ID REQUIRED for active status');
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ 
                message: 'Plan ID is required for active subscriptions',
                receivedData: requestData
              })
            };
          }
          
          // Verify plan exists and get duration - MATCH DEVELOPMENT LOGIC
          const planDetails = await sql`SELECT id, name, duration, price FROM subscription_plans WHERE id = ${planId}`;
          console.log('📋 Plan details lookup:', planDetails);
          
          if (planDetails.length === 0) {
            console.error('❌ INVALID PLAN ID:', planId);
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ 
                message: 'Invalid plan ID', 
                planId,
                availablePlans: [
                  { id: 1, name: 'Basic Plan', duration: 5 },
                  { id: 2, name: 'Premium Plan', duration: 14 },
                  { id: 3, name: 'VIP Plan', duration: 30 }
                ]
              })
            };
          }
          
          const plan = planDetails[0];
          const now = new Date();
          const activeEndDate = new Date();
          activeEndDate.setDate(now.getDate() + plan.duration);
          
          console.log('📅 DEVELOPMENT-MATCHED Active subscription creation:', {
            userId,
            planId: plan.id,
            planName: plan.name,
            duration: plan.duration,
            start: now.toISOString(),
            end: activeEndDate.toISOString(),
            durationDays: Math.round((activeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          });
          
          // Remove existing subscription first - MATCH DEVELOPMENT
          console.log('🗑️ DATABASE: Removing existing subscription for user:', userId);
          await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
          
          // Create new active subscription - EXACT DEVELOPMENT LOGIC
          console.log('📝 DATABASE: Creating active subscription...');
          const result = await sql`
            INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
            VALUES (${userId}, ${plan.id}, 'active', ${now.toISOString()}, ${activeEndDate.toISOString()}, NOW())
            RETURNING *
          `;
          
          console.log('✅ ACTIVE SUBSCRIPTION CREATED:', result[0]);
          return {
            statusCode: 200,
            headers: { ...headers, 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ success: true, subscription: result[0] })
          };
          
        } else if (status === 'inactive') {
          console.log('🟡 Setting subscription to INACTIVE for user:', userId);
          
          const now = new Date();
          const inactiveEndDate = new Date();
          inactiveEndDate.setDate(now.getDate() - 1); // Set to yesterday to ensure inactive
          
          console.log('📅 DEVELOPMENT-MATCHED Inactive subscription:', {
            userId,
            status: 'inactive',
            start: now.toISOString(),
            end: inactiveEndDate.toISOString()
          });
          
          // Remove existing subscription first - MATCH DEVELOPMENT
          console.log('🗑️ DATABASE: Removing existing subscription for user:', userId);
          await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
          
          // Create inactive subscription - DEVELOPMENT LOGIC
          console.log('📝 DATABASE: Creating inactive subscription...');
          const result = await sql`
            INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at)
            VALUES (${userId}, 1, 'inactive', ${now.toISOString()}, ${inactiveEndDate.toISOString()}, NOW())
            RETURNING *
          `;
          
          console.log('✅ DEVELOPMENT-MATCHED INACTIVE SUBSCRIPTION CREATED:', result[0]);
          return {
            statusCode: 200,
            headers: { ...headers, 'Cache-Control': 'no-cache' },
            body: JSON.stringify({ success: true, subscription: result[0] })
          };
          
        } else {
          console.error('❌ UNHANDLED STATUS:', status);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              message: 'Unhandled subscription status',
              status,
              validStatuses: ['active', 'inactive', 'expired', 'trial']
            })
          };
        }
        
      } catch (subscriptionError) {
        console.error('❌ SUBSCRIPTION UPDATE ERROR:', subscriptionError);
        console.error('❌ ERROR STACK:', subscriptionError.stack);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            message: 'Database error during subscription update',
            error: subscriptionError.message,
            userId,
            status,
            planId,
            errorType: subscriptionError.name
          })
        };
      }
    }

    console.log('❌ No route matched:', { path, method, userId });
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found', debug: { path, method, userId } })
    };

  } catch (error) {
    console.error('Admin error:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        stack: error.stack 
      })
    };
  }
};