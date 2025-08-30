const https = require('https');

console.log('🔍 Testing LinkedIn OAuth Configuration...\n');

// Test 1: Check if server is running
console.log('1️⃣ Testing server connectivity...');
const testServer = () => {
  return new Promise((resolve) => {
    const req = https.get('http://localhost:3000/api/test-linkedin', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ Server is running');
          console.log('📋 Configuration:');
          console.log(`   - LinkedIn Client ID: ${config.config.linkedinClientId}`);
          console.log(`   - LinkedIn Client Secret: ${config.config.linkedinClientSecret}`);
          console.log(`   - NEXTAUTH_URL: ${config.config.nextAuthUrl}`);
          console.log(`   - Callback URL: ${config.config.callbackUrl}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Failed to parse server response');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Server is not running. Please start with: pnpm dev');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server timeout. Please check if server is running.');
      resolve(false);
    });
  });
};

// Test 2: Check LinkedIn connect endpoint
const testLinkedInConnect = () => {
  return new Promise((resolve) => {
    const req = https.get('http://localhost:3000/api/linkedin/connect?signin=true', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.authUrl) {
            console.log('✅ LinkedIn connect endpoint is working');
            console.log(`🔗 Auth URL generated: ${response.authUrl.substring(0, 50)}...`);
            resolve(true);
          } else {
            console.log('❌ LinkedIn connect endpoint failed');
            console.log('Error:', response.error);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Failed to parse LinkedIn connect response');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ LinkedIn connect endpoint error');
      resolve(false);
    });
  });
};

// Run tests
async function runTests() {
  console.log('🚀 Starting LinkedIn connectivity tests...\n');
  
  const serverOk = await testServer();
  if (!serverOk) {
    console.log('\n❌ Server test failed. Please start the development server first.');
    return;
  }
  
  console.log('\n2️⃣ Testing LinkedIn connect endpoint...');
  const connectOk = await testLinkedInConnect();
  
  console.log('\n📋 Test Summary:');
  console.log(`   - Server: ${serverOk ? '✅' : '❌'}`);
  console.log(`   - LinkedIn Connect: ${connectOk ? '✅' : '❌'}`);
  
  if (serverOk && connectOk) {
    console.log('\n🎉 All tests passed! LinkedIn OAuth should work correctly.');
    console.log('\n🌐 Next steps:');
    console.log('   1. Open: http://localhost:3000/auth/signin');
    console.log('   2. Click "Sign in with LinkedIn"');
    console.log('   3. Complete the OAuth flow');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
}

runTests().catch(console.error);
