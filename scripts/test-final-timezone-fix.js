#!/usr/bin/env node

/**
 * Final test for timezone fix
 */

const { MongoClient, ObjectId } = require('mongodb');

async function testFinalTimezoneFix() {
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

    // Test: Schedule a post for 12:54 PM IST
    console.log('\n🧪 Testing: Schedule post for 12:54 PM IST');
    
    const now = new Date();
    const scheduledIST = new Date(now.getTime() + (2 * 60 * 1000)); // 2 minutes from now
    scheduledIST.setHours(12, 54, 0, 0); // Set to 12:54 PM IST
    
    console.log(`📅 Current time: ${now.toLocaleString('en-IN')}`);
    console.log(`📅 Scheduled time (IST): ${scheduledIST.toLocaleString('en-IN')}`);
    
    // Store the time as is (no conversion needed since we're already in IST)
    console.log(`🌍 Time to store: ${scheduledIST.toISOString()}`);

    const testPost = {
      userId: testUser._id,
      userEmail: testUser.email,
      content: `🧪 Final timezone fix test - Scheduled for 12:54 PM IST - ${new Date().toISOString()}`,
      images: [],
      scheduledFor: scheduledIST, // Store as is (no conversion)
      status: "pending",
      platform: "linkedin",
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      tags: ["timezone", "test", "final", "fix"]
    };

    console.log('\n📝 Creating test post...');
    const result = await db.collection("scheduled_posts").insertOne(testPost);
    console.log(`✅ Test post created with ID: ${result.insertedId}`);

    // Retrieve and display the post
    const createdPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('\n📋 Post details:');
    console.log(`   Content: ${createdPost.content}`);
    console.log(`   Scheduled For (stored): ${createdPost.scheduledFor.toISOString()}`);
    console.log(`   Scheduled For (display): ${createdPost.scheduledFor.toLocaleString('en-IN')}`);
    console.log(`   Status: ${createdPost.status}`);

    // Verify the time is correct
    const expectedTime = "12:54 PM";
    const actualTime = createdPost.scheduledFor.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (actualTime.toLowerCase() === expectedTime.toLowerCase()) {
      console.log('✅ SUCCESS: Post is scheduled for the correct time!');
      console.log(`   Expected: ${expectedTime}`);
      console.log(`   Actual: ${actualTime}`);
    } else {
      console.log('❌ FAILED: Post is not scheduled for the correct time!');
      console.log(`   Expected: ${expectedTime}`);
      console.log(`   Actual: ${actualTime}`);
    }

    // Wait for the scheduled time and check if cron job processes it
    const waitTime = (scheduledIST - new Date()) + (60 * 1000); // +1 minute buffer
    if (waitTime > 0) {
      console.log(`\n⏳ Waiting ${Math.round(waitTime / 1000)} seconds for cron job to process...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check if the post was processed
    const updatedPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('\n📊 Post status after processing:');
    console.log(`   Status: ${updatedPost.status}`);
    console.log(`   Posted At: ${updatedPost.postedAt ? new Date(updatedPost.postedAt).toISOString() : 'N/A'}`);
    console.log(`   LinkedIn Post ID: ${updatedPost.linkedInPostId || 'N/A'}`);
    console.log(`   Error: ${updatedPost.errorMessage || 'N/A'}`);

    if (updatedPost.status === "posted") {
      console.log('🎉 SUCCESS: Complete scheduling flow is working correctly!');
      console.log(`   ✅ Post was scheduled for 12:54 PM IST`);
      console.log(`   ✅ Post was stored correctly`);
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
testFinalTimezoneFix().catch(console.error);
