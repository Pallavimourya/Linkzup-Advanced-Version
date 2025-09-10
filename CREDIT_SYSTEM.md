# Credit System Implementation Guide

This guide covers the complete credit deduction system, trial period management, and plan accessibility features implemented in Linkzup.

## Overview

The credit system manages user credits based on different actions and provides plan-based accessibility controls. New users get a 2-day free trial with 10 credits to experience the platform.

## Trial System

### Free Trial for New Users
- **Duration**: 2 days from registration
- **Credits**: 10 free credits to get started
- **Features**: Full access to all AI content generation features
- **Expiration**: Automatic after 2 days or when credits are exhausted

### Trial States
1. **Active Trial with Credits**: User can use all features
2. **Active Trial, No Credits**: Trial period still active but credits exhausted - user needs to purchase
3. **Expired Trial, No Credits**: Trial period ended - user must purchase credits to continue

### Trial Management
- Trial status is automatically checked on each credit deduction
- Trial expiration is handled by cron job (`/api/cron/trial-expiration`)
- Users receive clear messaging about trial status and payment requirements

## Credit Costs

### Content Generation Actions
- **Text only**: 0.5 credits
- **Text + Post to LinkedIn**: 1 credit
- **Text + Image generation**: 1.5 credits
- **Text + Image + Post**: 2 credits

### Other Actions
- **Image generation only**: 1 credit
- **Auto-posting scheduled**: 0.5 credits
- **Carousel creation**: Free
- **Scheduling posts**: Free

## Plan Structure

### Base Plans (Monthly Subscription)
Each plan provides a fixed number of credits per month that reset automatically.

#### Basic Plan (₹499/month)
- **50 credits per month** (resets monthly)
- Text generation: 100 posts
- With posting: 50 posts
- Image generation: 50 images
- Auto-posting: 50 actions

#### Most Popular Plan (₹799/month)
- **100 credits per month** (resets monthly)
- Text generation: 200 posts
- With posting: 100 posts
- Image generation: 100 images
- Auto-posting: 100 actions

#### Professional Plan (₹5999/month)
- **1000 credits per month** (resets monthly)
- Text generation: 2000 posts
- With posting: 1000 posts
- Image generation: 1000 images
- Auto-posting: 1000 actions

### Additional Credit Packs
Users can purchase additional credits when they run out of monthly credits.

#### Small Pack (₹299)
- 30 credits (valid for 12 months)
- Perfect for small needs

#### Medium Pack (₹499)
- 60 credits (20% bonus, valid for 12 months)

#### Large Pack (₹999)
- 150 credits (50% bonus, valid for 12 months)
- Priority support

#### Enterprise Pack (₹1999)
- 400 credits (100% bonus, valid for 12 months)
- Priority support + dedicated assistance

## API Endpoints

### Credit Deduction
- `POST /api/credits/deduct` - Deduct credits for an action (includes trial validation)
- `GET /api/credits/transactions` - Get credit transaction history
- `POST /api/credits/usage` - Update usage statistics
- `GET /api/credits/usage` - Get current usage

### Billing Integration
- `GET /api/billing/credits` - Get credit info with usage and trial status
- `POST /api/billing/credits` - Update credits

### Trial Management
- `POST /api/cron/trial-expiration` - Cron job to expire trials automatically

## Database Collections

### credit_transactions
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId,
  actionType: String,        // 'text_only', 'text_with_post', etc.
  credits: Number,           // Negative for deductions
  description: String,
  timestamp: Date,
  remainingCredits: Number
}
\`\`\`

### users (updated)
\`\`\`javascript
{
  _id: ObjectId,
  credits: Number,           // Additional credits (never expire)
  monthlyCredits: Number,    // Monthly credits (reset each month)
  monthlyCreditsResetDate: Date, // Last reset date
  // Trial-related fields
  trialStartDate: Date,      // When trial started
  trialPeriodDays: Number,   // Trial duration (2 days)
  isTrialActive: Boolean,    // Whether trial is still active
  totalCreditsEver: Number,  // Total credits ever received (including trial)
  plan: String,              // 'free', 'basic', 'popular', 'professional'
  usage: {
    "2024-01": {
      textOnly: Number,
      textWithPost: Number,
      textWithImage: Number,
      textImagePost: Number,
      imageOnly: Number,
      autoPost: Number,
      total: Number
    }
  }
}
\`\`\`

## Components

### 1. CreditTransactions
- Displays credit transaction history
- Shows action types, credits deducted, and remaining balance
- Includes pagination

### 2. PlanAccessibility
- Shows current plan limits and usage
- Visual progress bars for each action type
- Plan features comparison

### 3. MonthlyCreditStatus
- Displays monthly credit allocation and usage
- Shows additional credits separately
- Monthly reset information and controls

### 3. useCredits Hook
- Easy credit deduction in components
- Credit checking before actions
- Error handling and user feedback

## Usage Examples

### Using the useCredits Hook
\`\`\`typescript
import { useCredits } from "@/hooks/use-credits"

function MyComponent() {
  const { deductCredits, checkCredits, loading } = useCredits(userCredits)

  const handleTextGeneration = async () => {
    const success = await deductCredits('text_only', 'Generated LinkedIn post')
    if (success) {
      // Proceed with text generation
    }
  }

  const canPost = checkCredits('text_with_post').canPerform
}
\`\`\`

### Direct API Usage
\`\`\`typescript
// Deduct credits
const response = await fetch('/api/credits/deduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    actionType: 'text_with_post',
    description: 'Posted to LinkedIn'
  })
})

// Check credits
const { canPerform, requiredCredits } = canPerformAction(userCredits, 'text_with_post')
\`\`\`

## Credit Utility Functions

### canPerformAction(userCredits, actionType)
Returns whether user can perform an action and credit requirements.

### getPlanAccessibility(userPlan)
Returns plan limits and accessibility information.

### getActionDescription(actionType)
Returns human-readable description of action.

### getActionCredits(actionType)
Returns credit cost for an action.

## Integration Points

### 1. Content Generation
- Check credits before generation
- Deduct credits after successful generation
- Update usage statistics

### 2. LinkedIn Posting
- Check credits before posting
- Deduct credits after successful post
- Track posting usage

### 3. Image Generation
- Check credits before generation
- Deduct credits after successful generation
- Update image usage

### 4. Auto-posting
- Check credits before auto-posting
- Deduct credits for each auto-post
- Track auto-posting usage

## Error Handling

### Insufficient Credits
- Returns 402 status code
- Includes required credits and current balance
- Shows user-friendly error message

### Invalid Action Type
- Returns 400 status code
- Validates against CREDIT_ACTIONS

### Server Errors
- Returns 500 status code
- Logs error details
- Shows generic error message

## Security Considerations

1. **Server-side Validation**: All credit checks happen on the server
2. **Transaction Recording**: Every credit deduction is recorded
3. **Usage Tracking**: Monthly usage is tracked and limited
4. **Plan Enforcement**: Plan limits are enforced server-side

## Testing

### Test Credit Deduction
\`\`\`typescript
// Test credit deduction
const response = await fetch('/api/credits/deduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    actionType: 'text_only',
    description: 'Test deduction'
  })
})
\`\`\`

### Test Credit Checking
\`\`\`typescript
// Test credit checking
const { canPerform, requiredCredits } = canPerformAction(10, 'text_with_post')
console.log(canPerform) // true
console.log(requiredCredits) // 1
\`\`\`

## Monitoring

### Key Metrics
- Credit deduction success rate
- Insufficient credit errors
- Usage patterns by action type
- Plan upgrade conversions

### Logging
- All credit transactions are logged
- Usage statistics are tracked
- Error conditions are monitored

## Future Enhancements

1. **Credit Refunds**: Allow credit refunds for failed actions
2. **Bulk Operations**: Support for bulk credit operations
3. **Usage Analytics**: Advanced usage analytics and reporting
4. **Credit Expiry**: Credit expiration system
5. **Promotional Credits**: Promotional credit system

## Troubleshooting

### Common Issues
1. **Credits not deducted**: Check API response and error logs
2. **Usage not updated**: Verify usage API calls
3. **Plan limits exceeded**: Check plan enforcement logic
4. **Transaction not recorded**: Verify database connection

### Debug Steps
1. Check browser console for errors
2. Monitor server logs
3. Verify credit balance
4. Check transaction history
5. Validate API responses
