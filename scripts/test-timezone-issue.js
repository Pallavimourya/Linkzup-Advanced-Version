#!/usr/bin/env node

/**
 * Test script to identify the exact timezone issue
 */

const { MongoClient, ObjectId } = require('mongodb');

async function testTimezoneIssue() {
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

    // Test 1: Check current timezone
    console.log('\n🧪 Test 1: Current timezone analysis');
    const now = new Date();
    console.log(`   UTC time: ${now.toISOString()}`);
    console.log(`   IST time: ${now.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
    console.log(`   Local time: ${now.toLocaleString()}`);
    console.log(`   Timezone offset: ${now.getTimezoneOffset()} minutes`);

    // Test 2: Simulate user setting 12:54 PM
    console.log('\n🧪 Test 2: User sets 12:54 PM');
    
    // Method 1: Direct time setting (what user does)
    const userInput = new Date();
    userInput.setHours(12, 54, 0, 0);
    console.log(`   User input (local): ${userInput.toLocaleString()}`);
    console.log(`   User input (IST): ${userInput.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
    
    // Method 2: IST timezone aware setting
    const istInput = new Date();
    istInput.setHours(12, 54, 0, 0);
    const istString = istInput.toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' });
    const utcFromIST = new Date(istString + 'Z');
    console.log(`   IST to UTC: ${utcFromIST.toISOString()}`);
    console.log(`   Back to IST: ${utcFromIST.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);

    // Test 3: Check existing scheduled posts
    console.log('\n🧪 Test 3: Check existing scheduled posts');
    const existingPosts = await db.collection("scheduled_posts").find({}).limit(5).toArray();
    
    if (existingPosts.length > 0) {
      console.log(`   Found ${existingPosts.length} existing posts:`);
      existingPosts.forEach((post, index) => {
        console.log(`   Post ${index + 1}:`);
        console.log(`     Content: ${post.content.substring(0, 50)}...`);
        console.log(`     Scheduled (UTC): ${post.scheduledFor.toISOString()}`);
        console.log(`     Scheduled (IST): ${post.scheduledFor.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
        console.log(`     Status: ${post.status}`);
      });
    } else {
      console.log('   No existing scheduled posts found');
    }

    // Test 4: Create a test post with proper timezone handling
    console.log('\n🧪 Test 4: Create test post with proper timezone');
    
    const testTime = new Date();
    testTime.setHours(12, 54, 0, 0);
    
    // Convert to UTC properly
    const utcTime = new Date(testTime.getTime() - (5.5 * 60 * 60 * 1000));
    
    const testPost = {
      userId: testUser._id,
      userEmail: testUser.email,
      content: `🧪 Timezone test - 12:54 PM IST - ${new Date().toISOString()}`,
      images: [],
      scheduledFor: utcTime,
      status: "pending",
      platform: "linkedin",
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      tags: ["timezone", "test"]
    };

    const result = await db.collection("scheduled_posts").insertOne(testPost);
    console.log(`   Test post created with ID: ${result.insertedId}`);
    
    const createdPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log(`   Stored time (UTC): ${createdPost.scheduledFor.toISOString()}`);
    console.log(`   Display time (IST): ${createdPost.scheduledFor.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);

    // Clean up
    await db.collection("scheduled_posts").deleteOne({ _id: result.insertedId });
    console.log('   Test post cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testTimezoneIssue().catch(console.error);
