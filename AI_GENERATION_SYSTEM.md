# AI Generation System

This document describes the AI content generation system used in the Linkzup application.

## Overview

The AI generation system provides a unified interface for generating various types of content using multiple AI providers. The system currently supports:

- **OpenAI GPT-4** (Primary provider)
- **Perplexity AI** (Fallback provider)

## Architecture

### Core Components

1. **AIService** (`lib/ai-service.ts`): Centralized service managing AI requests
2. **API Routes** (`app/api/ai/`): REST endpoints for content generation
3. **Queue System**: Manages concurrent requests and prevents rate limiting
4. **Credit System**: Tracks and manages user credits for AI usage

### Request Flow

1. User submits generation request via API
2. Request is validated and authenticated
3. Credits are checked and reserved
4. Request is added to processing queue
5. AI service generates content using selected provider
6. Credits are deducted upon successful generation
7. Response is returned to user

## Supported Content Types

- **linkedin-post**: 6 unique LinkedIn posts
- **article**: Comprehensive articles
- **topics**: Viral-worthy topic titles
- **carousel**: LinkedIn carousel content
- **story**: Personal, relatable stories
- **list**: Numbered list content
- **quote**: Inspirational quote posts
- **before-after**: Transformation content
- **tips**: Actionable tips
- **insights**: Deep analysis content
- **question**: Discussion-starting questions

## Customization Options

Each generation request can be customized with:

- **Tone**: professional, casual, friendly, authoritative, conversational, inspirational
- **Language**: Any language (default: English)
- **Word Count**: Target word count for content
- **Target Audience**: Specific audience description
- **Main Goal**: engagement, awareness, conversion, education, entertainment
- **Niche**: Specific industry or topic area
- **Hashtags**: Include relevant hashtags
- **Emojis**: Use emojis appropriately
- **Call to Action**: Include clear CTAs
- **Temperature**: AI creativity level (0.0-1.0)
- **Max Tokens**: Maximum response length

## API Usage

### Generate Content

```typescript
POST /api/ai/generate

{
  "type": "linkedin-post",
  "prompt": "Digital marketing strategies",
  "provider": "openai", // or "perplexity"
  "customization": {
    "tone": "professional",
    "wordCount": 150,
    "targetAudience": "Marketing professionals",
    "mainGoal": "engagement",
    "includeHashtags": true,
    "includeEmojis": true,
    "callToAction": true
  }
}
```

### Response Format

```typescript
{
  "success": true,
  "data": {
    "id": "resp_1234567890_abc123",
    "requestId": "req_1234567890_abc123",
    "content": ["Post 1", "Post 2", "Post 3", "Post 4", "Post 5", "Post 6"],
    "metadata": {
      "provider": "openai",
      "model": "gpt-4",
      "tokensUsed": 1250,
      "processingTime": 2500,
      "cost": 0.075
    },
    "status": "success",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "queue": {
    "queueLength": 0,
    "activeRequests": 1,
    "maxConcurrentRequests": 3,
    "isProcessing": true
  }
}
```

### Check Queue Status

```typescript
GET /api/ai/generate
```

Returns current queue status and system health information.

## Configuration

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Service Configuration

The AI service can be configured in `lib/ai-service.ts`:

```typescript
class AIService {
  private maxConcurrentRequests = 3 // Adjust based on your needs
  // ... other configuration options
}
```

## Provider Comparison

### OpenAI GPT-4
- **Pros**: High quality, consistent output, advanced reasoning
- **Cons**: Higher cost, slower response times
- **Best for**: Professional content, complex topics, high-quality articles
- **Cost**: ~$0.03 per 1K prompt tokens, ~$0.06 per 1K completion tokens

### Perplexity AI
- **Pros**: Lower cost, faster response times, real-time information
- **Cons**: Variable quality, less consistent formatting
- **Best for**: Quick content, cost-sensitive operations, real-time topics
- **Cost**: ~$0.02 per 1K tokens

## Error Handling

The system provides comprehensive error handling:

- **Authentication errors**: 401 responses for unauthenticated requests
- **Credit errors**: 402 responses for insufficient credits
- **Validation errors**: 400 responses with detailed error information
- **Processing errors**: 500 responses with error details
- **Queue management**: Automatic retry and fallback mechanisms

## Performance Considerations

- **Concurrent requests**: Limited to prevent API rate limiting
- **Request queuing**: Prevents system overload
- **Progress tracking**: Real-time feedback for user experience
- **Cost tracking**: Automatic cost calculation and credit management
- **Caching**: Consider implementing response caching for repeated requests

## Extending the System

### Adding New AI Providers

1. Add provider to `AIProvider` type
2. Implement generation method in `AIService`
3. Add provider options to customization panel
4. Update cost calculation logic

### Adding New Content Types

1. Add type to `ContentType` union
2. Implement prompt building logic
3. Add response parsing if needed
4. Update credit requirements

### Adding New Customization Options

1. Extend `CustomizationOptions` interface
2. Update prompt building logic
3. Add UI controls to customization panel
4. Update validation logic

## Best Practices

1. **Always check authentication** before making requests
2. **Handle errors gracefully** with user-friendly messages
3. **Monitor queue status** to provide better UX
4. **Use appropriate content types** for different use cases
5. **Save and reuse presets** for consistent generation
6. **Monitor costs** and implement appropriate limits
7. **Test with different providers** to find optimal settings

## Troubleshooting

### Common Issues

1. **Queue not processing**: Check if max concurrent requests is reached
2. **High costs**: Adjust max tokens or use Perplexity for cost-effective generation
3. **Slow generation**: Check queue length and consider switching providers
4. **Authentication errors**: Ensure user is properly authenticated
5. **Credit errors**: Check user's credit balance and trial status

### Debug Information

The system provides detailed debug information in responses:
- Request IDs for tracking
- Processing times for performance monitoring
- Token usage for cost analysis
- Error details for troubleshooting

## Security Considerations

- All requests require authentication
- API keys are stored securely in environment variables
- Request validation prevents malicious inputs
- Credit system prevents abuse
- Rate limiting prevents API quota exhaustion

