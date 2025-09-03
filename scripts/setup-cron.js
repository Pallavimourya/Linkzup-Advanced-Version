#!/usr/bin/env node

/**
 * Setup script for external cron system
 * This script helps configure cron-job.org for automatic posting
 */

const fs = require('fs');
const path = require('path');

function generateCronConfig() {
  console.log('🚀 Linkzup External Cron Setup\n');
  
  // Check for environment variables
  const envPath = path.join(process.cwd(), '.env.local');
  let cronSecret = 'your-super-secret-cron-key-here';
  let appUrl = 'https://your-app-domain.vercel.app';
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const cronSecretMatch = envContent.match(/CRON_SECRET=(.+)/);
    const appUrlMatch = envContent.match(/NEXT_PUBLIC_APP_URL=(.+)/);
    
    if (cronSecretMatch) {
      cronSecret = cronSecretMatch[1];
    }
    
    if (appUrlMatch) {
      appUrl = appUrlMatch[1];
    }
  }
  
  console.log('📋 Cron Job Configuration for cron-job.org');
  console.log('==========================================\n');
  
  console.log('🔗 URL:');
  console.log(`   ${appUrl}/api/cron/external-auto-post\n`);
  
  console.log('📝 Method:');
  console.log('   POST\n');
  
  console.log('🔑 Headers:');
  console.log(`   Authorization: Bearer ${cronSecret}`);
  console.log('   Content-Type: application/json\n');
  
  console.log('⏰ Schedule:');
  console.log('   Every minute (* * * * *)\n');
  
  console.log('🌍 Timezone:');
  console.log('   Asia/Kolkata (IST)\n');
  
  console.log('📊 Expected Response:');
  console.log('   Status: 200 OK');
  console.log('   Content-Type: application/json');
  console.log('   Body: JSON with processing results\n');
  
  console.log('🧪 Test Commands:');
  console.log('==================\n');
  
  console.log('1. Test with Node.js:');
  console.log(`   node scripts/test-external-cron.js\n`);
  
  console.log('2. Test with curl:');
  console.log(`   curl -X POST "${appUrl}/api/cron/external-auto-post" \\`);
  console.log(`     -H "Authorization: Bearer ${cronSecret}" \\`);
  console.log(`     -H "Content-Type: application/json"\n`);
  
  console.log('3. Test with Postman:');
  console.log(`   URL: ${appUrl}/api/cron/external-auto-post`);
  console.log(`   Method: POST`);
  console.log(`   Headers: Authorization: Bearer ${cronSecret}`);
  console.log(`   Headers: Content-Type: application/json\n`);
  
  console.log('📝 Setup Steps:');
  console.log('===============\n');
  
  console.log('1. Go to https://cron-job.org and create an account');
  console.log('2. Click "Create cronjob"');
  console.log('3. Fill in the configuration above');
  console.log('4. Set timezone to Asia/Kolkata');
  console.log('5. Enable the cron job');
  console.log('6. Test with the commands above');
  console.log('7. Monitor execution logs in cron-job.org dashboard\n');
  
  console.log('🔍 Monitoring:');
  console.log('==============\n');
  
  console.log('• Check cron-job.org dashboard for execution logs');
  console.log('• Monitor your application logs for cron activity');
  console.log('• Check database for post status changes');
  console.log('• Verify posts are being published to LinkedIn\n');
  
  console.log('⚠️  Important Notes:');
  console.log('====================\n');
  
  console.log('• The cron job runs every minute to check for due posts');
  console.log('• Posts are processed if they are due within the last 5 minutes');
  console.log('• Failed posts are retried up to 3 times');
  console.log('• Users must have sufficient credits for posting');
  console.log('• LinkedIn accounts must be properly connected\n');
  
  console.log('🎯 Success Indicators:');
  console.log('======================\n');
  
  console.log('✅ Cron job executes every minute');
  console.log('✅ Posts are being processed');
  console.log('✅ Status updates in database');
  console.log('✅ Posts published to LinkedIn');
  console.log('✅ Credits deducted correctly\n');
  
  // Generate config file
  const configContent = `# Cron Job Configuration for cron-job.org
# Generated on ${new Date().toISOString()}

Title: Linkzup Auto Posting
URL: ${appUrl}/api/cron/external-auto-post
Method: POST
Headers:
  Authorization: Bearer ${cronSecret}
  Content-Type: application/json
Schedule: Every minute (* * * * *)
Timezone: Asia/Kolkata (IST)
Enabled: Yes

# Test Commands
# Node.js: node scripts/test-external-cron.js
# curl: curl -X POST "${appUrl}/api/cron/external-auto-post" -H "Authorization: Bearer ${cronSecret}" -H "Content-Type: application/json"
`;
  
  const configPath = path.join(process.cwd(), 'cron-job-config.txt');
  fs.writeFileSync(configPath, configContent);
  
  console.log(`💾 Configuration saved to: ${configPath}`);
  console.log('📋 You can copy this file content to cron-job.org\n');
}

// Run the setup
generateCronConfig();
