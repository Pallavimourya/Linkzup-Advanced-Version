// Comprehensive test to verify real content uniqueness
const testRealContentUniqueness = async () => {
  try {
    console.log('🔍 Testing REAL content uniqueness (not template-based)...')
    console.log('='.repeat(70))
    
    const topic = 'The Power of Resilience in Professional Growth'
    const results = []
    
    // Generate 3 different pieces of content for the same topic
    for (let i = 1; i <= 3; i++) {
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
          lines: content.split('\n').filter(line => line.trim().length > 0)
        })
        
        console.log(`✅ Content #${i} generated successfully (${content.length} chars)`)
        
        // Show the full content for analysis
        console.log(`\n📄 FULL CONTENT #${i}:`)
        console.log('-'.repeat(50))
        console.log(content)
        console.log('-'.repeat(50))
      } else {
        console.log(`❌ Failed to generate content #${i}`)
      }
      
      // Add a delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('🔍 DETAILED UNIQUENESS ANALYSIS')
    console.log('='.repeat(70))
    
    if (results.length < 2) {
      console.log('❌ Not enough content generated for comparison')
      return
    }
    
    // Analyze each section separately
    const analyses = results.map((result, index) => {
      const lines = result.lines
      const opening = lines.find(line => !line.startsWith('•') && !line.startsWith('#')) || ''
      const bullets = lines.filter(line => line.startsWith('•'))
      const closing = lines.filter(line => !line.startsWith('•') && !line.startsWith('#')).slice(-1)[0] || ''
      const hashtags = lines.filter(line => line.startsWith('#')).join(' ')
      
      return {
        id: result.id,
        opening: opening,
        bullets: bullets,
        closing: closing,
        hashtags: hashtags,
        fullContent: result.content
      }
    })
    
    // Check opening paragraph uniqueness
    const openings = analyses.map(a => a.opening)
    const uniqueOpenings = [...new Set(openings)]
    console.log(`📝 Opening Paragraphs:`)
    openings.forEach((opening, i) => {
      console.log(`  ${i + 1}. ${opening.substring(0, 100)}...`)
    })
    console.log(`🎯 Unique openings: ${uniqueOpenings.length}/${openings.length}`)
    
    // Check bullet point uniqueness
    console.log(`\n🔸 Bullet Points Analysis:`)
    const allBullets = analyses.flatMap(a => a.bullets)
    const uniqueBullets = [...new Set(allBullets)]
    console.log(`🎯 Total bullets: ${allBullets.length}, Unique: ${uniqueBullets.length}`)
    
    analyses.forEach((analysis, i) => {
      console.log(`\n  Content #${i + 1} bullets:`)
      analysis.bullets.forEach((bullet, j) => {
        console.log(`    ${j + 1}. ${bullet.substring(0, 80)}...`)
      })
    })
    
    // Check closing paragraph uniqueness
    const closings = analyses.map(a => a.closing)
    const uniqueClosings = [...new Set(closings)]
    console.log(`\n📄 Closing Paragraphs:`)
    closings.forEach((closing, i) => {
      console.log(`  ${i + 1}. ${closing.substring(0, 100)}...`)
    })
    console.log(`🎯 Unique closings: ${uniqueClosings.length}/${closings.length}`)
    
    // Check hashtag uniqueness
    const hashtagSets = analyses.map(a => a.hashtags)
    const uniqueHashtagSets = [...new Set(hashtagSets)]
    console.log(`\n#️⃣ Hashtag Sets:`)
    hashtagSets.forEach((hashtags, i) => {
      console.log(`  ${i + 1}. ${hashtags}`)
    })
    console.log(`🎯 Unique hashtag sets: ${uniqueHashtagSets.length}/${hashtagSets.length}`)
    
    // Overall uniqueness score
    const openingUniqueness = (uniqueOpenings.length / openings.length) * 100
    const bulletUniqueness = (uniqueBullets.length / allBullets.length) * 100
    const closingUniqueness = (uniqueClosings.length / closings.length) * 100
    const hashtagUniqueness = (uniqueHashtagSets.length / hashtagSets.length) * 100
    
    const overallUniqueness = (openingUniqueness + bulletUniqueness + closingUniqueness + hashtagUniqueness) / 4
    
    console.log('\n' + '='.repeat(70))
    console.log('🏆 UNIQUENESS SCORES')
    console.log('='.repeat(70))
    console.log(`📝 Opening Uniqueness: ${openingUniqueness.toFixed(1)}%`)
    console.log(`🔸 Bullet Uniqueness: ${bulletUniqueness.toFixed(1)}%`)
    console.log(`📄 Closing Uniqueness: ${closingUniqueness.toFixed(1)}%`)
    console.log(`#️⃣ Hashtag Uniqueness: ${hashtagUniqueness.toFixed(1)}%`)
    console.log(`🏆 Overall Uniqueness: ${overallUniqueness.toFixed(1)}%`)
    
    // Check for template patterns
    console.log('\n' + '='.repeat(70))
    console.log('🔍 TEMPLATE PATTERN DETECTION')
    console.log('='.repeat(70))
    
    const templatePatterns = [
      'Reflecting on my journey',
      'Throughout my life',
      'When I think about',
      'My journey with',
      'These experiences have taught me',
      'Looking back on my journey',
      'My relationship with',
      'As I continue to grow'
    ]
    
    let templateUsage = 0
    templatePatterns.forEach(pattern => {
      const usage = results.filter(r => r.content.includes(pattern)).length
      if (usage > 0) {
        console.log(`⚠️  Template pattern "${pattern}" used in ${usage}/${results.length} content pieces`)
        templateUsage += usage
      }
    })
    
    const templateScore = (templateUsage / (results.length * templatePatterns.length)) * 100
    console.log(`🎯 Template Usage Score: ${templateScore.toFixed(1)}% (lower is better)`)
    
    // Final assessment
    console.log('\n' + '='.repeat(70))
    console.log('🎯 FINAL ASSESSMENT')
    console.log('='.repeat(70))
    
    if (overallUniqueness >= 80 && templateScore <= 20) {
      console.log('✅ EXCELLENT: Content shows high uniqueness with minimal template usage!')
    } else if (overallUniqueness >= 60 && templateScore <= 40) {
      console.log('⚠️  GOOD: Content shows moderate uniqueness, but some template usage detected.')
    } else if (overallUniqueness >= 40) {
      console.log('⚠️  FAIR: Content shows some variety, but significant template usage.')
    } else {
      console.log('❌ POOR: Content is too repetitive and template-based.')
    }
    
    // Show specific differences
    if (results.length >= 2) {
      console.log('\n' + '='.repeat(70))
      console.log('🔍 SIDE-BY-SIDE COMPARISON')
      console.log('='.repeat(70))
      
      console.log('\n📝 Opening Paragraph Comparison:')
      console.log(`Content #1: ${analyses[0].opening}`)
      console.log(`Content #2: ${analyses[1].opening}`)
      
      if (results.length >= 3) {
        console.log(`Content #3: ${analyses[2].opening}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing content uniqueness:', error.message)
  }
}

// Run the test
testRealContentUniqueness()
