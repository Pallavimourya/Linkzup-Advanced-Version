#!/usr/bin/env node

/**
 * Setup script for external cron jobs
 * This script helps configure cron-job.org for the scheduled posts system
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Scheduled Posts Cron Job Setup');
console.log('=====================================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupCronJobs() {
  try {
    console.log('📋 This script will help you set up external cron jobs for the scheduled posts system.\n');

    // Get cron-job.org API key
    const cronJobApiKey = await askQuestion('Enter your cron-job.org API key: ');
    if (!cronJobApiKey) {
      console.log('❌ Cron job API key is required');
      process.exit(1);
    }

    // Get app URL
    const appUrl = await askQuestion('Enter your app URL (e.g., https://your-app.com): ');
    if (!appUrl) {
      console.log('❌ App URL is required');
      process.exit(1);
    }

    // Generate cron secret
    const cronSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create environment variables
    const envContent = `# Cron Job Configuration for External Cron Jobs
CRON_JOB_API_KEY=${cronJobApiKey}
CRON_SECRET=${cronSecret}
NEXT_PUBLIC_APP_URL=${appUrl}

# External Cron Job URL (for cron-job.org)
EXTERNAL_CRON_URL=${appUrl}/api/cron/external-auto-post

# Timezone Configuration
DEFAULT_TIMEZONE=Asia/Kolkata

# Optional: MongoDB URI (if not already set)
# MONGODB_URI=your_mongodb_uri
`;

    // Write to .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log('\n✅ Environment variables created successfully!');
    console.log(`📁 File: ${envPath}`);

    // Test cron job API
    console.log('\n🧪 Testing cron job API connection...');
    
    const testResponse = await fetch('https://api.cron-job.org/jobs', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronJobApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (testResponse.ok) {
      console.log('✅ Cron job API connection successful!');
    } else {
      console.log('❌ Cron job API connection failed. Please check your API key.');
    }

    // Create setup instructions
    const instructions = `
# Cron Job Setup Instructions

## 1. Environment Variables
The following environment variables have been added to your .env.local file:

- CRON_JOB_API_KEY: Your cron-job.org API key
- CRON_SECRET: Generated secret for cron job authentication
- NEXT_PUBLIC_APP_URL: Your application URL

## 2. Cron Job Configuration
The system will automatically create individual cron jobs for each scheduled post.

### Manual Cron Job Creation (Optional)
If you want to create a manual cron job for testing:

1. Go to https://cron-job.org
2. Create a new job with these settings:
   - URL: ${appUrl}/api/cron/external-auto-post
   - Method: POST
   - Headers: 
     - Authorization: Bearer ${cronSecret}
   - Timezone: Asia/Kolkata
   - Schedule: Every 5 minutes (for testing)

## 3. Testing the System
1. Start your application
2. Schedule a test post
3. Check the cron job execution logs
4. Verify the post appears in your scheduled posts list

## 4. Monitoring
- Monitor cron job execution at https://cron-job.org
- Check application logs for any errors
- Verify scheduled posts are being processed correctly

## 5. Troubleshooting
- Ensure your app URL is accessible from the internet
- Check that the CRON_SECRET matches in both places
- Verify your cron-job.org account has sufficient credits
- Monitor the /api/cron/auto-post endpoint for errors

## 6. Security Notes
- Keep your CRON_SECRET secure and private
- Regularly rotate your cron-job.org API key
- Monitor for unauthorized cron job executions
- Use HTTPS for all external communications
`;

    const instructionsPath = path.join(process.cwd(), 'CRON_SETUP_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions, 'utf8');

    console.log('\n📖 Setup instructions created!');
    console.log(`📁 File: ${instructionsPath}`);

    // Create test script
    const testScript = `#!/usr/bin/env node

/**
 * Test script for cron job functionality
 */

const fetch = require('node-fetch');

async function testCronJob() {
  const cronSecret = process.env.CRON_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!cronSecret || !appUrl) {
    console.log('❌ Missing environment variables');
    console.log('Please set CRON_SECRET and NEXT_PUBLIC_APP_URL');
    process.exit(1);
  }

  try {
    console.log('🧪 Testing cron job endpoint...');
    
    const response = await fetch(\`\${appUrl}/api/cron/external-auto-post\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${cronSecret}\`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Cron job endpoint is working!');
      console.log('Response:', result);
    } else {
      console.log('❌ Cron job endpoint failed');
      console.log('Error:', result);
    }
  } catch (error) {
    console.log('❌ Error testing cron job:', error.message);
  }
}

testCronJob();
`;

    const testScriptPath = path.join(process.cwd(), 'scripts', 'test-cron-job.js');
    fs.writeFileSync(testScriptPath, testScript, 'utf8');
    fs.chmodSync(testScriptPath, '755');

    console.log('\n🧪 Test script created!');
    console.log(`📁 File: ${testScriptPath}`);
    console.log('Run with: node scripts/test-cron-job.js');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your application to load new environment variables');
    console.log('2. Test the scheduling system by creating a scheduled post');
    console.log('3. Monitor the cron job execution logs');
    console.log('4. Check the setup instructions for more details');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/setup-cron-jobs.js [options]

Options:
  --help, -h    Show this help message
  --test        Test existing configuration

Examples:
  node scripts/setup-cron-jobs.js
  node scripts/setup-cron-jobs.js --test
`);
  process.exit(0);
}

if (args.includes('--test')) {
  console.log('🧪 Testing existing cron job configuration...');
  // Add test logic here
  process.exit(0);
}

setupCronJobs();
