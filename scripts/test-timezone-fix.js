#!/usr/bin/env node

/**
 * Test script to verify timezone fixes
 * This script tests the IST timezone handling
 */

const { MongoClient, ObjectId } = require('mongodb');

// IST utility functions (copied from lib/ist-utils.ts)
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

async function testTimezoneFix() {
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

    // Test timezone conversion
    console.log('\n🧪 Testing timezone conversions:');
    
    // Create a test time in IST (12:31 PM)
    const istTime = new Date();
    istTime.setHours(12, 31, 0, 0); // 12:31 PM IST
    
    console.log(`📅 IST Time: ${istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    
    // Convert to UTC for storage
    const utcTime = istToUtc(istTime);
    console.log(`🌍 UTC Time (stored): ${utcTime.toISOString()}`);
    
    // Convert back to IST for display
    const displayTime = utcToIst(utcTime);
    console.log(`🕐 Display Time (IST): ${formatIstDateShort(utcTime)} at ${formatIstTime(utcTime)}`);
    
    // Create a test scheduled post
    const testPost = {
      userId: testUser._id,
      userEmail: testUser.email,
      content: `🧪 Timezone test post - ${new Date().toISOString()}`,
      images: [],
      scheduledFor: utcTime, // Store in UTC
      status: "pending",
      platform: "linkedin",
      type: "text",
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      tags: ["timezone", "test"]
    };

    console.log('\n📝 Creating test post with UTC time...');
    const result = await db.collection("scheduled_posts").insertOne(testPost);
    console.log(`✅ Test post created with ID: ${result.insertedId}`);

    // Retrieve and display the post
    const createdPost = await db.collection("scheduled_posts").findOne({ _id: result.insertedId });
    console.log('\n📋 Post details:');
    console.log(`   Content: ${createdPost.content}`);
    console.log(`   Scheduled For (UTC): ${createdPost.scheduledFor.toISOString()}`);
    console.log(`   Scheduled For (IST): ${formatIstDateShort(createdPost.scheduledFor)} at ${formatIstTime(createdPost.scheduledFor)}`);
    console.log(`   Status: ${createdPost.status}`);

    // Verify the time is correct
    const expectedIST = "12:31 PM";
    const actualIST = formatIstTime(createdPost.scheduledFor);
    
    if (actualIST === expectedIST) {
      console.log('✅ SUCCESS: Timezone conversion is working correctly!');
      console.log(`   Expected: ${expectedIST}`);
      console.log(`   Actual: ${actualIST}`);
    } else {
      console.log('❌ FAILED: Timezone conversion is not working correctly!');
      console.log(`   Expected: ${expectedIST}`);
      console.log(`   Actual: ${actualIST}`);
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
testTimezoneFix().catch(console.error);
