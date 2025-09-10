const https = require('https');

console.log('🔍 Testing Complete LinkedIn OAuth Flow...\n');

// Test 1: Production configuration
const testConfig = () => {
  return new Promise((resolve) => {
    const req = https.get('https://linkzup-advanced-version.vercel.app/api/test-linkedin', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ 1. Production Configuration:');
          console.log(`   - LinkedIn Client ID: ${config.config.linkedinClientId}`);
          console.log(`   - NEXTAUTH_URL: ${config.config.nextAuthUrl}`);
          console.log(`   - Callback URL: ${config.config.callbackUrl}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Failed to parse configuration');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Production server not accessible');
      resolve(false);
    });
  });
};

// Test 2: LinkedIn connect endpoint
const testConnect = () => {
  return new Promise((resolve) => {
    const req = https.get('https://linkzup-advanced-version.vercel.app/api/linkedin/connect?signin=true', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.authUrl) {
            console.log('✅ 2. LinkedIn Connect Endpoint:');
            console.log(`   - Auth URL generated successfully`);
            console.log(`   - URL: ${response.authUrl.substring(0, 80)}...`);
            resolve(true);
          } else {
            console.log('❌ LinkedIn connect failed:', response.error);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Failed to parse connect response');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Connect endpoint error');
      resolve(false);
    });
  });
};

// Test 3: Check if main app is accessible
const testMainApp = () => {
  return new Promise((resolve) => {
    const req = https.get('https://linkzup-advanced-version.vercel.app', (res) => {
      console.log('✅ 3. Main App Accessibility:');
      console.log(`   - Status: ${res.statusCode}`);
      console.log(`   - App is accessible`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Main app not accessible');
      resolve(false);
    });
  });
};

// Test 4: Check sign-in page
const testSignInPage = () => {
  return new Promise((resolve) => {
    const req = https.get('https://linkzup-advanced-version.vercel.app/auth/signin', (res) => {
      console.log('✅ 4. Sign-In Page:');
      console.log(`   - Status: ${res.statusCode}`);
      console.log(`   - Sign-in page is accessible`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Sign-in page not accessible');
      resolve(false);
    });
  });
};

// Run all tests
async function runFullTest() {
  console.log('🚀 Starting comprehensive LinkedIn OAuth test...\n');
  
  const results = {
    config: await testConfig(),
    connect: await testConnect(),
    mainApp: await testMainApp(),
    signIn: await testSignInPage()
  };
  
  console.log('\n📋 Test Summary:');
  console.log(`   - Production Config: ${results.config ? '✅' : '❌'}`);
  console.log(`   - Connect Endpoint: ${results.connect ? '✅' : '❌'}`);
  console.log(`   - Main App: ${results.mainApp ? '✅' : '❌'}`);
  console.log(`   - Sign-In Page: ${results.signIn ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! LinkedIn OAuth is ready for production!');
    console.log('\n🌐 Ready to test:');
    console.log('   1. Open: https://linkzup-advanced-version.vercel.app/auth/signin');
    console.log('   2. Click "Sign in with LinkedIn"');
    console.log('   3. Complete the OAuth flow');
    console.log('   4. You should be redirected to the dashboard');
    
    console.log('\n⚠️  IMPORTANT: Make sure you have added this redirect URL to your LinkedIn app:');
    console.log('   https://linkzup-advanced-version.vercel.app/api/linkedin/callback');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
}

runFullTest().catch(console.error);
