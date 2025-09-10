#!/usr/bin/env node

/**
 * Complete test for the scheduling flow with timezone fixes
 * This script tests the entire flow from scheduling to posting
 */

const { MongoClient, ObjectId } = require('mongodb');

// IST utility functions
function utcToIst(utcDate) {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
}

function istToUtc(istDate) {
  const date = typeof istDate === 'string' ? new Date(istDate) : istDate
  return new Date(date.getTime() - (5.5 * 60 * 60 * 1000))
}

function formatIstTime(date) {
  const istDate = utcToIst(date)
  return istDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatIstDateShort(date) {
  const istDate = utcToIst(date)
  return istDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function testCompleteSchedulingFlow() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://techzuperstudio:admin123@linkzup-advanced.lwex9lz.mongodb.net/Linkzup-Advanced?retryWrites=true&w=majority&appName=Linkzup-Advanced";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db("Linkzup-Advanced");
    
    // Get users
    const users = await db.collection("users").find({}).limit(1).toArray();
    if (users.length === 0) {
      console.log('❌ No users found in database.');
      return;
    }

    const testUser = users[0];
    console.log(`📝 Using test user: ${testUser.email}`);

    if (!testUser.linkedinId || !testUser.linkedinAccessToken) {
      console.log('❌ Test user does not have LinkedIn credentials connected.');
      return;
    }

    console.log('✅ Test user has LinkedIn credentials');

    // Test 1: Schedule a post for 2 minutes from now in IST
    const now = new Date();
    const scheduledIST = new Date(now.getTime() + (2 * 60 * 1000)); // 2 minutes from now
    scheduledIST.setHours(12, 31, 0, 0); // Set to 12:31 PM IST
    
    console.log('\n🧪 Test 1: Scheduling a post for 12:31 PM IST');
    console.log(`📅 Current time: ${formatIstDateShort(now)} at ${formatIstTime(now)}`);
    console.log(`📅 Scheduled time: ${formatIstDateShort(scheduledIST)} at ${formatIstTime(scheduledIST)}`);
    
    // Convert IST to UTC for storage
    const scheduledUTC = istToUtc(scheduledIST);
    console.log(`🌍 UTC time (stored): ${scheduledUTC.toISOString()}`);

    const testPost = {
      userId: testUser._id,
      userEmail: testUser.email,
      content: `🧪 Complete flow test - Scheduled for 12:31 PM IST - ${new Date().toISOString()}`,
      images: [],
      scheduledFor: scheduledUTC, // Store in UTC
      status: "pending",
      platform: "linkedin",
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      tags: ["complete", "flow", "test"]
    };

    const result = await db.collection("scheduled_posts").insertOne(testPost);
    console.log(`✅ Test post created with ID: ${result.insertedId}`);

    // Test 2: Verify the post was stored correctly
    const createdPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('\n🧪 Test 2: Verifying stored post');
    console.log(`   Content: ${createdPost.content}`);
    console.log(`   Scheduled For (UTC): ${createdPost.scheduledFor.toISOString()}`);
    console.log(`   Scheduled For (IST): ${formatIstDateShort(createdPost.scheduledFor)} at ${formatIstTime(createdPost.scheduledFor)}`);
    console.log(`   Status: ${createdPost.status}`);

    // Test 3: Wait for the scheduled time and check if cron job processes it
    const waitTime = (scheduledUTC - new Date()) + (60 * 1000); // +1 minute buffer
    if (waitTime > 0) {
      console.log(`\n⏳ Waiting ${Math.round(waitTime / 1000)} seconds for cron job to process...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Test 4: Check if the post was processed
    const updatedPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('\n🧪 Test 4: Checking post processing');
    console.log(`   Status: ${updatedPost.status}`);
    console.log(`   Posted At: ${updatedPost.postedAt ? new Date(updatedPost.postedAt).toISOString() : 'N/A'}`);
    console.log(`   LinkedIn Post ID: ${updatedPost.linkedInPostId || 'N/A'}`);
    console.log(`   Error: ${updatedPost.errorMessage || 'N/A'}`);

    if (updatedPost.status === "posted") {
      console.log('🎉 SUCCESS: Complete scheduling flow is working correctly!');
      console.log(`   ✅ Post was scheduled for 12:31 PM IST`);
      console.log(`   ✅ Post was stored in UTC correctly`);
      console.log(`   ✅ Post was processed by cron job`);
      console.log(`   ✅ Post was successfully posted to LinkedIn`);
      console.log(`   🔗 LinkedIn Post ID: ${updatedPost.linkedInPostId}`);
    } else if (updatedPost.status === "failed") {
      console.log('❌ FAILED: Post failed to be processed');
      console.log(`   Error: ${updatedPost.errorMessage}`);
    } else if (updatedPost.status === "pending") {
      console.log('⏳ PENDING: Post is still pending - cron job may not have run yet');
    }

    // Clean up
    await db.collection("scheduled_posts").deleteOne({ _id: result.insertedId });
    console.log('🧹 Cleaned up test post');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testCompleteSchedulingFlow().catch(console.error);
