const http = require('http');

console.log('🔍 Quick LinkedIn OAuth Test\n');

// Test configuration
const testConfig = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/test-linkedin', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ Configuration Status:');
          console.log(`   - LinkedIn Client ID: ${config.config.linkedinClientId}`);
          console.log(`   - NEXTAUTH_URL: ${config.config.nextAuthUrl}`);
          console.log(`   - Callback URL: ${config.config.callbackUrl}`);
          console.log(`   - Environment: ${config.config.environment}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Failed to parse configuration');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Server not running. Start with: pnpm dev');
      resolve(false);
    });
  });
};

// Test LinkedIn connect endpoint
const testConnect = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/linkedin/connect?signin=true', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.authUrl) {
            console.log('✅ LinkedIn connect endpoint working');
            console.log(`🔗 Auth URL: ${response.authUrl.substring(0, 80)}...`);
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

// Run tests
async function runQuickTest() {
  console.log('1️⃣ Testing configuration...');
  const configOk = await testConfig();
  
  if (configOk) {
    console.log('\n2️⃣ Testing LinkedIn connect...');
    const connectOk = await testConnect();
    
    console.log('\n📋 Results:');
    console.log(`   - Configuration: ${configOk ? '✅' : '❌'}`);
    console.log(`   - Connect Endpoint: ${connectOk ? '✅' : '❌'}`);
    
    if (configOk && connectOk) {
      console.log('\n🎉 All tests passed!');
      console.log('\n🌐 Next steps:');
      console.log('   1. Make sure LinkedIn app has redirect URL: http://localhost:3000/api/linkedin/callback');
      console.log('   2. Open: http://localhost:3000/auth/signin');
      console.log('   3. Click "Sign in with LinkedIn"');
    } else {
      console.log('\n⚠️  Some tests failed. Check configuration.');
    }
  }
}

runQuickTest().catch(console.error);
