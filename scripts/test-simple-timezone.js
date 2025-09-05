#!/usr/bin/env node

/**
 * Simple timezone test
 */

function testTimezoneConversion() {
  console.log('🧪 Testing timezone conversion...\n');

  // Test 1: User sets 12:54 PM
  console.log('📅 Test 1: User sets 12:54 PM');
  
  const userInput = new Date();
  userInput.setHours(12, 54, 0, 0);
  console.log(`   User input: ${userInput.toLocaleString()}`);
  console.log(`   User input (IST): ${userInput.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
  
  // Convert to UTC for storage
  const utcForStorage = new Date(userInput.getTime() - (5.5 * 60 * 60 * 1000));
  console.log(`   UTC for storage: ${utcForStorage.toISOString()}`);
  
  // Convert back to IST for display
  const istForDisplay = new Date(utcForStorage.getTime() + (5.5 * 60 * 60 * 1000));
  console.log(`   Back to IST: ${istForDisplay.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
  
  // Check if times match
  const expected = "12:54 PM";
  const actual = istForDisplay.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  if (actual.toLowerCase() === expected.toLowerCase()) {
    console.log('   ✅ SUCCESS: Time conversion is correct!');
  } else {
    console.log('   ❌ FAILED: Time conversion is incorrect!');
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
  }

  // Test 2: Check current time
  console.log('\n📅 Test 2: Current time');
  const now = new Date();
  console.log(`   Current UTC: ${now.toISOString()}`);
  console.log(`   Current IST: ${now.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
  console.log(`   Current Local: ${now.toLocaleString()}`);
}

// Run the test
testTimezoneConversion();
