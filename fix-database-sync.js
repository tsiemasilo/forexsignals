import { neon } from '@neondatabase/serverless';

// Use the correct database URL provided by user
const DATABASE_URL = 'postgresql://neondb_owner:npg_6oThiEj3WdxB@ep-sweet-surf-aepuh0z9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function fixAdminUser() {
  console.log('🔍 Checking current admin user status...');
  
  try {
    // Check current admin user
    const adminCheck = await sql`
      SELECT id, email, first_name, last_name, is_admin 
      FROM users 
      WHERE email = 'admin@forexsignals.com'
    `;
    
    console.log('Current admin user:', adminCheck[0]);
    
    if (adminCheck.length === 0) {
      console.log('❌ Admin user not found, creating...');
      
      // Create admin user if not exists
      const newAdmin = await sql`
        INSERT INTO users (email, first_name, last_name, is_admin)
        VALUES ('admin@forexsignals.com', 'Admin', 'User', true)
        RETURNING id, email, first_name, last_name, is_admin
      `;
      
      console.log('✅ Admin user created:', newAdmin[0]);
    } else if (!adminCheck[0].is_admin) {
      console.log('❌ Admin user exists but is_admin is false, fixing...');
      
      // Update admin flag
      const updatedAdmin = await sql`
        UPDATE users 
        SET is_admin = true 
        WHERE email = 'admin@forexsignals.com'
        RETURNING id, email, first_name, last_name, is_admin
      `;
      
      console.log('✅ Admin user updated:', updatedAdmin[0]);
    } else {
      console.log('✅ Admin user is correctly configured');
    }
    
    // Check Almeerah user
    const almeerahCheck = await sql`
      SELECT id, email, first_name, last_name, is_admin 
      FROM users 
      WHERE email = 'almeerahlosper@gmail.com'
    `;
    
    console.log('Almeerah user:', almeerahCheck[0]);
    
    // Ensure Almeerah is NOT admin
    if (almeerahCheck.length > 0 && almeerahCheck[0].is_admin) {
      await sql`
        UPDATE users 
        SET is_admin = false 
        WHERE email = 'almeerahlosper@gmail.com'
      `;
      console.log('✅ Almeerah set as regular user');
    }
    
    console.log('🎉 Database admin configuration complete!');
    
  } catch (error) {
    console.error('❌ Database fix error:', error);
  }
}

fixAdminUser();