#!/usr/bin/env node

/**
 * Test script for the complete scheduled posting flow
 * This script creates a test scheduled post and verifies the cron job processes it
 */

const { MongoClient, ObjectId } = require('mongodb');

async function testScheduledPostingFlow() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://techzuperstudio:admin123@linkzup-advanced.lwex9lz.mongodb.net/Linkzup-Advanced?retryWrites=true&w=majority&appName=Linkzup-Advanced";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db("Linkzup-Advanced");
    
    // Check if users collection exists and has users
    const users = await db.collection("users").find({}).limit(1).toArray();
    if (users.length === 0) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    const testUser = users[0];
    console.log(`📝 Using test user: ${testUser.email} (ID: ${testUser._id})`);

    // Check if user has LinkedIn credentials
    if (!testUser.linkedinId || !testUser.linkedinAccessToken) {
      console.log('❌ Test user does not have LinkedIn credentials connected.');
      console.log('💡 Please connect LinkedIn account for this user first.');
      return;
    }

    console.log('✅ Test user has LinkedIn credentials');

    // Create a test scheduled post for 2 minutes from now
    const scheduledFor = new Date();
    scheduledFor.setMinutes(scheduledFor.getMinutes() + 2);

    const testPost = {
      userId: testUser._id,
      userEmail: testUser.email,
      content: `🧪 Test scheduled post from automated testing - ${new Date().toISOString()}`,
      images: [],
      scheduledFor: scheduledFor,
      status: "pending",
      platform: "linkedin",
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      tags: ["test", "automated"]
    };

    console.log(`📅 Creating test post scheduled for: ${scheduledFor.toISOString()}`);

    // Insert the test post
    const result = await db.collection("scheduled_posts").insertOne(testPost);
    console.log(`✅ Test post created with ID: ${result.insertedId}`);

    // Verify the post was created
    const createdPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('📋 Created post details:', {
      id: createdPost._id,
      content: createdPost.content,
      scheduledFor: createdPost.scheduledFor,
      status: createdPost.status,
      userId: createdPost.userId
    });

    console.log('\n⏰ Waiting for scheduled time...');
    console.log(`🕐 Current time: ${new Date().toISOString()}`);
    console.log(`🕐 Scheduled time: ${scheduledFor.toISOString()}`);
    console.log(`⏱️  Time remaining: ${Math.round((scheduledFor - new Date()) / 1000)} seconds`);

    // Wait for the scheduled time + 1 minute buffer
    const waitTime = (scheduledFor - new Date()) + (60 * 1000); // +1 minute buffer
    if (waitTime > 0) {
      console.log(`⏳ Waiting ${Math.round(waitTime / 1000)} seconds for cron job to process...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check if the post was processed
    const updatedPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('\n📊 Post status after processing:');
    console.log({
      id: updatedPost._id,
      status: updatedPost.status,
      postedAt: updatedPost.postedAt,
      failedAt: updatedPost.failedAt,
      errorMessage: updatedPost.errorMessage,
      linkedInPostId: updatedPost.linkedInPostId,
      retryCount: updatedPost.retryCount
    });

    if (updatedPost.status === "posted") {
      console.log('🎉 SUCCESS: Test post was successfully posted to LinkedIn!');
      console.log(`🔗 LinkedIn Post ID: ${updatedPost.linkedInPostId}`);
    } else if (updatedPost.status === "failed") {
      console.log('❌ FAILED: Test post failed to post to LinkedIn');
      console.log(`💥 Error: ${updatedPost.errorMessage}`);
    } else if (updatedPost.status === "pending") {
      console.log('⏳ PENDING: Test post is still pending - cron job may not have run yet');
      console.log('💡 Check cron-job.org dashboard for execution logs');
    }

    // Clean up - delete the test post
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
testScheduledPostingFlow().catch(console.error);
