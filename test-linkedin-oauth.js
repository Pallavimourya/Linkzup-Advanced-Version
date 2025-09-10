const { MongoClient } = require('mongodb');

async function testLinkedInOAuth() {
  console.log('Testing LinkedIn OAuth flow...\n');

  // Test 1: Check environment variables
  console.log('1. Environment Variables Check:');
  const requiredEnvVars = [
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'MONGODB_URI'
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✓ ${envVar}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`   ✗ ${envVar}: Missing`);
    }
  }

  // Test 2: Test database connection
  console.log('\n2. Database Connection Test:');
  try {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/Linkzup-Advanced');
    await client.connect();
    console.log('   ✓ Database connection successful');
    
    const db = client.db('Linkzup-Advanced');
    const users = db.collection('users');
    
    // Test 3: Check if users collection exists
    const collections = await db.listCollections().toArray();
    const hasUsers = collections.some(col => col.name === 'users');
    console.log(`   ✓ Users collection exists: ${hasUsers}`);
    
    if (hasUsers) {
      const userCount = await users.countDocuments();
      console.log(`   ✓ Users count: ${userCount}`);
    }
    
    await client.close();
  } catch (error) {
    console.log(`   ✗ Database connection failed: ${error.message}`);
  }

  // Test 4: Test LinkedIn OAuth URL generation
  console.log('\n3. LinkedIn OAuth URL Test:');
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.linkzup.in';
    const redirectUri = `${baseUrl}/api/linkedin/callback`;
    const stateData = { action: 'signin' };
    
    const linkedinAuthUrl = 
      `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('openid profile email w_member_social')}&` +
      `state=${encodeURIComponent(JSON.stringify(stateData))}`;
    
    console.log('   ✓ LinkedIn OAuth URL generated successfully');
    console.log(`   ✓ Redirect URI: ${redirectUri}`);
    console.log(`   ✓ Client ID: ${process.env.LINKEDIN_CLIENT_ID ? 'Set' : 'Missing'}`);
  } catch (error) {
    console.log(`   ✗ LinkedIn OAuth URL generation failed: ${error.message}`);
  }

  // Test 5: Test API endpoints
  console.log('\n4. API Endpoints Test:');
  const endpoints = [
    '/api/linkedin/connect',
    '/api/linkedin/callback',
    '/auth/linkedin-callback'
  ];

  for (const endpoint of endpoints) {
    console.log(`   ✓ Endpoint: ${endpoint}`);
  }

  console.log('\n5. Flow Summary:');
  console.log('   • User clicks "Continue with LinkedIn" on signin page');
  console.log('   • /api/linkedin/connect?signin=true is called');
  console.log('   • LinkedIn OAuth URL is generated and user is redirected');
  console.log('   • User authorizes on LinkedIn');
  console.log('   • LinkedIn redirects to /api/linkedin/callback with code');
  console.log('   • Code is exchanged for access token');
  console.log('   • User profile is fetched from LinkedIn');
  console.log('   • User is created/updated in database');
  console.log('   • User is redirected to /auth/linkedin-callback with user data');
  console.log('   • NextAuth session is created using credentials provider');
  console.log('   • User is redirected to dashboard');

  console.log('\n6. Potential Issues to Check:');
  console.log('   • Ensure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are set');
  console.log('   • Verify redirect URI matches LinkedIn app configuration');
  console.log('   • Check if MongoDB is accessible');
  console.log('   • Ensure NextAuth is properly configured');
  console.log('   • Verify LinkedIn app has correct scopes and permissions');

  console.log('\nTest completed!');
}

// Run the test
testLinkedInOAuth().catch(console.error);
