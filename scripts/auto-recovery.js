#!/usr/bin/env node

/**
 * Auto-Recovery Script for Scheduled Posts
 * This script runs every 15 minutes to recover any stuck or failed posts
 */

const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.linkzup.in';

async function runAutoRecovery() {
  console.log('🔄 Starting Auto-Recovery Process...\n');

  try {
    // 1. Check system health
    console.log('📊 Checking system health...');
    const healthResponse = await fetch(`${APP_URL}/api/health/scheduled-posts`);
    
    if (!healthResponse.ok) {
      console.error('❌ Health check failed');
      return;
    }
    
    const health = await healthResponse.json();
    console.log(`✅ System status: ${health.status}`);
    
    if (health.metrics.overduePosts > 0) {
      console.log(`⚠️  Found ${health.metrics.overduePosts} overdue posts`);
    }
    
    // 2. Run backup cron to recover overdue posts
    if (health.metrics.overduePosts > 0) {
      console.log('🔄 Running backup cron to recover overdue posts...');
      const backupResponse = await fetch(`${APP_URL}/api/cron/backup-auto-post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (backupResponse.ok) {
        const backupResult = await backupResponse.json();
        console.log(`✅ Backup cron completed: ${backupResult.message}`);
        console.log(`📊 Processed ${backupResult.results.length} posts`);
        
        // Log results
        backupResult.results.forEach((result, index) => {
          const status = result.status === 'success' ? '✅' : '❌';
          console.log(`  ${index + 1}. ${status} Post ${result.postId}: ${result.status}`);
        });
      } else {
        console.error('❌ Backup cron failed');
      }
    }
    
    // 3. Run monitoring check
    console.log('🔍 Running monitoring check...');
    const monitorResponse = await fetch(`${APP_URL}/api/monitor/scheduled-posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (monitorResponse.ok) {
      const monitorResult = await monitorResponse.json();
      console.log(`✅ Monitoring completed`);
      
      if (monitorResult.alerts.length > 0) {
        console.log('⚠️  Alerts generated:');
        monitorResult.alerts.forEach(alert => {
          console.log(`  - ${alert.type.toUpperCase()}: ${alert.message}`);
        });
      }
      
      if (monitorResult.emailSent) {
        console.log('📧 Critical alert email sent to admin');
      }
    } else {
      console.error('❌ Monitoring check failed');
    }
    
    console.log('\n🎯 Auto-Recovery Process Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Auto-Recovery Process Failed:', error.message);
    
    // Send emergency email
    try {
      const emailResponse = await fetch(`${APP_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: process.env.ADMIN_EMAIL || 'admin@linkzup.com',
          subject: '🚨 EMERGENCY: Auto-Recovery Script Failed',
          html: `
            <h2>Auto-Recovery Script Failed</h2>
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Action Required:</strong> Manual intervention needed immediately</p>
          `
        })
      });
      
      if (emailResponse.ok) {
        console.log('📧 Emergency email sent');
      }
    } catch (emailError) {
      console.error('❌ Failed to send emergency email:', emailError.message);
    }
  }
}

// Run the auto-recovery process
runAutoRecovery();
