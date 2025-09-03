const https = require('https');

console.log('🔍 Testing Production LinkedIn OAuth Configuration...\n');

// Test production configuration
const testProductionConfig = () => {
  return new Promise((resolve) => {
    const req = https.get('https://linkzup-advanced-version.vercel.app/api/test-linkedin', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ Production Configuration Status:');
          console.log(`   - LinkedIn Client ID: ${config.config.linkedinClientId}`);
          console.log(`   - NEXTAUTH_URL: ${config.config.nextAuthUrl}`);
          console.log(`   - Callback URL: ${config.config.callbackUrl}`);
          console.log(`   - Environment: ${config.config.environment}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Failed to parse production configuration');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Production server error:', error.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Production server timeout');
      resolve(false);
    });
  });
};

// Test production LinkedIn connect endpoint
const testProductionConnect = () => {
  return new Promise((resolve) => {
    const req = https.get('https://linkzup-advanced-version.vercel.app/api/linkedin/connect?signin=true', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.authUrl) {
            console.log('✅ Production LinkedIn connect endpoint working');
            console.log(`🔗 Auth URL: ${response.authUrl.substring(0, 80)}...`);
            resolve(true);
          } else {
            console.log('❌ Production LinkedIn connect failed:', response.error);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Failed to parse production connect response');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Production connect endpoint error:', error.message);
      resolve(false);
    });
  });
};

// Run tests
async function runProductionTests() {
  console.log('1️⃣ Testing production configuration...');
  const configOk = await testProductionConfig();
  
  if (configOk) {
    console.log('\n2️⃣ Testing production LinkedIn connect...');
    const connectOk = await testProductionConnect();
    
    console.log('\n📋 Production Test Results:');
    console.log(`   - Configuration: ${configOk ? '✅' : '❌'}`);
    console.log(`   - Connect Endpoint: ${connectOk ? '✅' : '❌'}`);
    
    if (configOk && connectOk) {
      console.log('\n🎉 Production tests passed!');
      console.log('\n🌐 Production URLs:');
      console.log('   - Sign-in: https://linkzup-advanced-version.vercel.app/auth/signin');
      console.log('   - Dashboard: https://linkzup-advanced-version.vercel.app/dashboard');
      console.log('   - Callback: https://linkzup-advanced-version.vercel.app/api/linkedin/callback');
    } else {
      console.log('\n⚠️  Some production tests failed.');
      console.log('   Make sure you have deployed the latest changes to Vercel.');
    }
  } else {
    console.log('\n❌ Production server not accessible.');
    console.log('   Make sure your app is deployed to Vercel.');
  }
}

runProductionTests().catch(console.error);
