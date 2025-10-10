// Test script to verify free model implementation
const testFreeModel = async () => {
  try {
    console.log("Testing free model implementation...")
    
    // Test data
    const testRequest = {
      type: "linkedin-post",
      prompt: "Remote work productivity tips",
      provider: "openai",
      customization: {
        model: "gpt-3.5-turbo", // Free model
        tone: "professional",
        wordCount: 150,
        includeHashtags: true,
        includeEmojis: true
      }
    }
    
    console.log("Test request:", JSON.stringify(testRequest, null, 2))
    
    // Make API call to test the implementation
    const response = await fetch("http://localhost:3000/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: You'll need to add authentication headers for this to work
      },
      body: JSON.stringify(testRequest)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log("✅ Success! Free model test passed")
      console.log("Generated content:", result.data?.content)
      console.log("Model used:", result.data?.metadata?.model)
      console.log("Cost:", result.data?.metadata?.cost)
    } else {
      console.log("❌ Test failed:", response.status, await response.text())
    }
    
  } catch (error) {
    console.log("❌ Test error:", error.message)
  }
}

// Run the test
testFreeModel()
