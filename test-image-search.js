// Test script for image search API
// Run this with: node test-image-search.js

async function testImageSearch() {
  console.log('🧪 Testing Image Search API...\n')
  
  const testCases = [
    { query: 'car', source: 'unsplash' },
    { query: 'nature', source: 'pexels' },
    { query: 'business', source: 'pixabay' },
    { query: 'technology', source: 'google' }
  ]
  
  for (const testCase of testCases) {
    console.log(`🔍 Testing: "${testCase.query}" from ${testCase.source}`)
    
    try {
      const response = await fetch('http://localhost:3000/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Success: Found ${data.images?.length || 0} images`)
        console.log(`   Source: ${data.source}`)
        console.log(`   Query: ${data.query}`)
        
        if (data.images && data.images.length > 0) {
          console.log(`   First image: ${data.images[0].url.substring(0, 50)}...`)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log(`❌ Error: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log('🏁 Test completed!')
}

// Run the test
testImageSearch().catch(console.error)
