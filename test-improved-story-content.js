// Test script for improved story content generation
const testImprovedStoryContent = async () => {
  try {
    console.log('Testing improved story content generation...')
    
    const response = await fetch('http://localhost:3000/api/story-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicText: 'The Power of Resilience in Professional Growth',
        contentType: 'linkedin-post'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API Response:', JSON.stringify(data, null, 2))
    
    if (data.success && data.content) {
      console.log('✅ Content generated successfully!')
      console.log('📝 Generated Content:')
      console.log('='.repeat(50))
      console.log(data.content.content)
      console.log('='.repeat(50))
      
      // Check if content follows proper format
      const content = data.content.content
      const lines = content.split('\n').filter(line => line.trim().length > 0)
      const hasOpening = lines.length > 0 && !lines[0].startsWith('•') && !lines[0].startsWith('#')
      const bulletPoints = lines.filter(line => line.startsWith('•'))
      const hasHashtags = lines.some(line => line.startsWith('#'))
      
      console.log('📊 Content Analysis:')
      console.log(`- Has opening paragraph: ${hasOpening}`)
      console.log(`- Number of bullet points: ${bulletPoints.length}`)
      console.log(`- Has hashtags: ${hasHashtags}`)
      console.log(`- Total lines: ${lines.length}`)
      console.log(`- Content length: ${content.length} characters`)
      
      if (hasOpening && bulletPoints.length >= 3 && hasHashtags) {
        console.log('✅ Content follows proper format!')
      } else {
        console.log('❌ Content format needs improvement')
      }
    } else {
      console.log('❌ Failed to generate content')
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message)
  }
}

// Run the test
testImprovedStoryContent()
