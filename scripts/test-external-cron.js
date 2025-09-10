#!/usr/bin/env node

/**
 * Test script for external cron system
 * This script simulates what cron-job.org would do
 */

const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://linkzup.in';

async function testExternalCron() {
  console.log('🧪 Testing External Cron System...\n');

  try {
    // Test the external cron endpoint
    const response = await fetch(`${APP_URL}/api/cron/external-auto-post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Cron request failed with status ${response.status}:`);
      console.error(errorText);
      return;
    }

    const result = await response.json();
    
    console.log('✅ External cron executed successfully!');
    console.log(`📊 Processed ${result.results?.length || 0} posts`);
    console.log(`⏰ Processed at: ${result.processedAt}`);
    
    if (result.results && result.results.length > 0) {
      console.log('\n📝 Results:');
      result.results.forEach((post, index) => {
        console.log(`  ${index + 1}. Post ${post.postId}: ${post.status}`);
        if (post.error) {
          console.log(`     Error: ${post.error}`);
        }
        if (post.linkedInPostId) {
          console.log(`     LinkedIn Post ID: ${post.linkedInPostId}`);
        }
      });
    } else {
      console.log('ℹ️  No posts were due for processing');
    }

    console.log('\n🎯 External cron system is working correctly!');
    console.log('💡 Make sure to set up cron-job.org to call this endpoint every minute:');
    console.log(`   URL: ${APP_URL}/api/cron/external-auto-post`);
    console.log(`   Method: POST`);
    console.log(`   Headers: Authorization: Bearer ${CRON_SECRET}`);

  } catch (error) {
    console.error('❌ Error testing external cron:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Make sure the APP_URL is correct and accessible');
    }
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure you have Node.js 18+ or install node-fetch');
    }
  }
}

// Run the test
testExternalCron();
