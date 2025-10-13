// Test script to verify content uniqueness and variety
const testContentUniqueness = async () => {
  try {
    console.log('🧪 Testing content uniqueness and variety...')
    console.log('='.repeat(60))
    
    const topic = 'The Power of Resilience in Professional Growth'
    const results = []
    
    // Generate 5 different pieces of content for the same topic
    for (let i = 1; i <= 5; i++) {
      console.log(`\n📝 Generating content #${i}...`)
      
      const response = await fetch('http://localhost:3000/api/story-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicText: topic,
          contentType: 'linkedin-post'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.content) {
        const content = data.content.content
        results.push({
          id: i,
          content: content,
          length: content.length,
          lines: content.split('\n').filter(line => line.trim().length > 0).length
        })
        
        console.log(`✅ Content #${i} generated successfully (${content.length} chars)`)
        
        // Show a preview of the content
        const preview = content.substring(0, 150) + '...'
        console.log(`📄 Preview: ${preview}`)
      } else {
        console.log(`❌ Failed to generate content #${i}`)
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 UNIQUENESS ANALYSIS')
    console.log('='.repeat(60))
    
    if (results.length < 2) {
      console.log('❌ Not enough content generated for comparison')
      return
    }
    
    // Analyze uniqueness
    const contentHashes = results.map(r => r.content.split(' ').slice(0, 10).join(' '))
    const uniqueHashes = [...new Set(contentHashes)]
    
    console.log(`📈 Total content pieces generated: ${results.length}`)
    console.log(`🎯 Unique opening sequences: ${uniqueHashes.length}`)
    console.log(`📊 Uniqueness ratio: ${(uniqueHashes.length / results.length * 100).toFixed(1)}%`)
    
    // Check for variety in content length
    const lengths = results.map(r => r.length)
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const lengthVariation = Math.max(...lengths) - Math.min(...lengths)
    
    console.log(`📏 Average content length: ${avgLength.toFixed(0)} characters`)
    console.log(`📐 Length variation: ${lengthVariation} characters`)
    
    // Check for variety in structure
    const bulletCounts = results.map(r => (r.content.match(/•/g) || []).length)
    const uniqueBulletCounts = [...new Set(bulletCounts)]
    
    console.log(`🔸 Bullet point counts: ${bulletCounts.join(', ')}`)
    console.log(`🎯 Unique bullet counts: ${uniqueBulletCounts.length}`)
    
    // Check for variety in opening paragraphs
    const openings = results.map(r => r.content.split('\n')[0])
    const uniqueOpenings = [...new Set(openings)]
    
    console.log(`📝 Unique opening lines: ${uniqueOpenings.length}`)
    
    // Overall assessment
    const uniquenessScore = (uniqueHashes.length / results.length) * 100
    const varietyScore = (uniqueBulletCounts.length / results.length) * 100
    const openingVarietyScore = (uniqueOpenings.length / results.length) * 100
    
    const overallScore = (uniquenessScore + varietyScore + openingVarietyScore) / 3
    
    console.log('\n' + '='.repeat(60))
    console.log('🏆 OVERALL ASSESSMENT')
    console.log('='.repeat(60))
    
    console.log(`🎯 Content Uniqueness: ${uniquenessScore.toFixed(1)}%`)
    console.log(`🔸 Structure Variety: ${varietyScore.toFixed(1)}%`)
    console.log(`📝 Opening Variety: ${openingVarietyScore.toFixed(1)}%`)
    console.log(`🏆 Overall Score: ${overallScore.toFixed(1)}%`)
    
    if (overallScore >= 80) {
      console.log('✅ EXCELLENT: Content shows high variety and uniqueness!')
    } else if (overallScore >= 60) {
      console.log('⚠️  GOOD: Content shows moderate variety, but could be improved.')
    } else {
      console.log('❌ POOR: Content is too repetitive and needs more variety.')
    }
    
    // Show sample differences
    if (results.length >= 2) {
      console.log('\n' + '='.repeat(60))
      console.log('🔍 SAMPLE COMPARISON')
      console.log('='.repeat(60))
      
      console.log('\n📄 Content #1 Opening:')
      console.log(results[0].content.split('\n')[0])
      
      console.log('\n📄 Content #2 Opening:')
      console.log(results[1].content.split('\n')[0])
      
      if (results.length >= 3) {
        console.log('\n📄 Content #3 Opening:')
        console.log(results[2].content.split('\n')[0])
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing content uniqueness:', error.message)
  }
}

// Run the test
testContentUniqueness()
