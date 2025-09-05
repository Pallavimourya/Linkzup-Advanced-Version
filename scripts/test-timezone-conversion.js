#!/usr/bin/env node

/**
 * Test script to verify timezone conversion is working correctly
 */

function utcToIst(utcDate) {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
}

function istToUtc(istDate) {
  const date = typeof istDate === 'string' ? new Date(istDate) : istDate
  const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in milliseconds
  return new Date(date.getTime() - istOffset)
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

async function testTimezoneConversion() {
  console.log('🧪 Testing timezone conversion...\n');

  // Test 1: User sets 12:54 PM IST
  console.log('📅 Test 1: User sets 12:54 PM IST');
  
  const userInputDate = new Date();
  userInputDate.setHours(12, 54, 0, 0); // 12:54 PM
  
  console.log(`   User input (local): ${userInputDate.toLocaleString()}`);
  console.log(`   User input (IST): ${userInputDate.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
  
  // Convert to UTC for storage
  const utcForStorage = istToUtc(userInputDate);
  console.log(`   UTC for storage: ${utcForStorage.toISOString()}`);
  
  // Convert back to IST for display
  const istForDisplay = utcToIst(utcForStorage);
  console.log(`   IST for display: ${formatIstDateShort(utcForStorage)} at ${formatIstTime(utcForStorage)}`);
  
  // Verify
  const expectedTime = "12:54 PM";
  const actualTime = formatIstTime(utcForStorage);
  
  if (actualTime.toLowerCase() === expectedTime.toLowerCase()) {
    console.log('   ✅ SUCCESS: Time conversion is correct!');
  } else {
    console.log('   ❌ FAILED: Time conversion is incorrect!');
    console.log(`   Expected: ${expectedTime}`);
    console.log(`   Actual: ${actualTime}`);
  }

  console.log('\n📅 Test 2: User sets 6:24 PM IST');
  
  const userInputDate2 = new Date();
  userInputDate2.setHours(18, 24, 0, 0); // 6:24 PM
  
  console.log(`   User input (local): ${userInputDate2.toLocaleString()}`);
  console.log(`   User input (IST): ${userInputDate2.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
  
  // Convert to UTC for storage
  const utcForStorage2 = istToUtc(userInputDate2);
  console.log(`   UTC for storage: ${utcForStorage2.toISOString()}`);
  
  // Convert back to IST for display
  const istForDisplay2 = utcToIst(utcForStorage2);
  console.log(`   IST for display: ${formatIstDateShort(utcForStorage2)} at ${formatIstTime(utcForStorage2)}`);
  
  // Verify
  const expectedTime2 = "6:24 PM";
  const actualTime2 = formatIstTime(utcForStorage2);
  
  if (actualTime2.toLowerCase() === expectedTime2.toLowerCase()) {
    console.log('   ✅ SUCCESS: Time conversion is correct!');
  } else {
    console.log('   ❌ FAILED: Time conversion is incorrect!');
    console.log(`   Expected: ${expectedTime2}`);
    console.log(`   Actual: ${actualTime2}`);
  }

  console.log('\n📅 Test 3: Current time conversion');
  
  const now = new Date();
  console.log(`   Current UTC: ${now.toISOString()}`);
  console.log(`   Current IST: ${now.toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}`);
  
  const nowIST = utcToIst(now);
  console.log(`   Converted IST: ${formatIstDateShort(now)} at ${formatIstTime(now)}`);
}

// Run the test
testTimezoneConversion().catch(console.error);
