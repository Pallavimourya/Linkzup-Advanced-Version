# AI Content Generation Credit System

## 🎯 Overview

The AI content generation system now properly deducts credits for all AI-generated content types. Credits are deducted **before** content generation to ensure users have sufficient credits before processing begins.

## 💳 Credit Costs by Content Type

### Base Credit Costs
| Content Type | Base Credits | OpenAI (1.5x) | Perplexity (0.7x) |
|--------------|--------------|---------------|-------------------|
| LinkedIn Post | 0.5 | 0.75 | 0.35 |
| Article | 0.3 | 0.45 | 0.21 |
| Topics | 0.1 | 0.15 | 0.07 |
| Carousel | 0.4 | 0.6 | 0.28 |
| Story | 0.2 | 0.3 | 0.14 |
| List | 0.2 | 0.3 | 0.14 |
| Quote | 0.1 | 0.15 | 0.07 |
| Before/After | 0.2 | 0.3 | 0.14 |
| Tips | 0.2 | 0.3 | 0.14 |
| Insights | 0.2 | 0.3 | 0.14 |
| Question | 0.1 | 0.15 | 0.07 |

## 🔄 Credit Deduction Flow

### 1. Pre-Generation Check
- Credits are checked and deducted **before** AI processing begins
- If insufficient credits, request is rejected with clear error message
- Trial users can generate content with their trial credits

### 2. Credit Deduction Process
```javascript
// Credit deduction happens in /api/ai/generate
const requiredCredits = getRequiredCredits(type, provider)
const actionType = `ai_${type}`

// Deduct credits before generation
await fetch('/api/credits/deduct', {
  method: 'POST',
  body: JSON.stringify({
    actionType,
    description: `AI ${type} generation using ${provider}`,
    credits: requiredCredits
  })
})
```

### 3. Transaction Recording
- All AI generation transactions are recorded in `credit_transactions` collection
- Includes action type, credits deducted, description, and timestamp
- Used for analytics and user history

## 📊 Credit Action Types

### AI Generation Actions
- `ai_linkedin-post` - LinkedIn post generation
- `ai_article` - Article generation
- `ai_topics` - Topic generation
- `ai_carousel` - Carousel generation
- `ai_story` - Story generation
- `ai_list` - List generation
- `ai_quote` - Quote generation
- `ai_before-after` - Before/after content
- `ai_tips` - Tips generation
- `ai_insights` - Insights generation
- `ai_question` - Question generation

## 🚨 Error Handling

### Insufficient Credits
```json
{
  "error": "Insufficient credits",
  "required": 0.75,
  "available": 0.5,
  "suggestion": "Please purchase more credits to continue"
}
```

### Trial Credits Exhausted
```json
{
  "error": "Trial credits exhausted. Please purchase credits to continue.",
  "isTrialActive": true,
  "trialExpired": false,
  "requiredCredits": 0.75,
  "currentCredits": 0,
  "totalAvailableCredits": 0
}
```

## 🔧 Implementation Details

### API Endpoint
- **POST** `/api/ai/generate`
- Credits deducted before content generation
- Proper error handling for insufficient credits
- Transaction logging for all generations

### Credit Utils Integration
- All AI actions added to `CREDIT_ACTIONS` in `lib/credit-utils.ts`
- Proper type definitions for AI generation actions
- Integration with existing credit deduction system

### Database Collections
- `credit_transactions` - Records all AI generation transactions
- `users` - Tracks user credits and trial status
- `notifications` - Sends credit-related notifications

## 📈 Analytics Integration

### Admin Dashboard
- AI generation credit usage tracking
- Content type popularity analysis
- Provider usage statistics
- Credit consumption patterns

### User Analytics
- Personal credit usage history
- Content generation statistics
- Credit efficiency metrics

## 🎯 Benefits

1. **Fair Usage**: Credits ensure fair usage of AI resources
2. **Cost Control**: Different providers have different costs
3. **Transparency**: Clear credit costs for each content type
4. **Analytics**: Comprehensive tracking of AI usage
5. **Trial Protection**: Trial users get limited but sufficient credits
6. **Error Prevention**: Credits checked before expensive AI processing

## 🔄 Future Enhancements

1. **Dynamic Pricing**: Adjust credits based on content complexity
2. **Bulk Generation**: Discounts for multiple content generation
3. **Premium Features**: Higher credit costs for advanced features
4. **Usage Limits**: Daily/monthly limits per user
5. **Credit Packages**: Specialized AI credit packages

The AI credit system is now fully integrated and ensures proper credit deduction for all AI content generation! 🚀
