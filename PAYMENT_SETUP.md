# Payment Integration Setup Guide

This guide will help you set up the complete payment integration system for Linkzup using Razorpay.

## Overview

The payment system includes:
- **Subscription Plans**: Monthly recurring payments (Basic: ₹499, Popular: ₹799, Professional: ₹5999)
- **Credit Packs**: One-time purchases for additional credits
- **Payment Processing**: Secure payment handling with Razorpay
- **Payment History**: Track all transactions
- **Subscription Management**: Cancel/reactivate subscriptions

## Environment Variables

Add these environment variables to your `.env.local` file:

\`\`\`env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Public Razorpay Key (for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
\`\`\`

## Razorpay Setup

### 1. Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account
3. Complete KYC verification

### 2. Get API Keys
1. Navigate to Settings → API Keys
2. Generate a new key pair
3. Copy the Key ID and Key Secret

### 3. Configure Webhooks
1. Go to Settings → Webhooks
2. Add a new webhook with URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`
4. Copy the webhook secret

## Database Collections

The system uses these MongoDB collections:

### 1. orders
\`\`\`javascript
{
  _id: ObjectId,
  orderId: String,        // Razorpay order ID
  userId: ObjectId,       // User ID
  planType: String,       // Plan name
  credits: Number,        // Credits to add
  amount: Number,         // Amount in INR
  status: String,         // "pending" | "completed"
  paymentId: String,      // Razorpay payment ID
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### 2. payments
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId,       // User ID
  orderId: String,        // Order ID
  paymentId: String,      // Razorpay payment ID
  planType: String,       // Plan name
  credits: Number,        // Credits purchased
  amount: Number,         // Amount paid
  status: String,         // "completed"
  createdAt: Date
}
\`\`\`

### 3. subscriptions
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId,       // User ID
  planType: String,       // Plan name
  status: String,         // "active" | "cancelled" | "expired"
  startDate: Date,        // Subscription start
  endDate: Date,          // Subscription end
  nextBillingDate: Date,  // Next billing date
  amount: Number,         // Monthly amount
  credits: Number,        // Monthly credits
  cancelledAt: Date,      // Cancellation date
  reactivatedAt: Date,    // Reactivation date
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Subscription Plans

### Monthly Subscriptions
1. **Basic Plan** - ₹499/month
   - 100 credits per month
   - Text generation: 200 posts
   - With posting: 100 posts
   - Image generation: 100 images
   - Basic analytics
   - Email support

2. **Most Popular** - ₹799/month
   - 200 credits per month
   - Text generation: 400 posts
   - With posting: 200 posts
   - Image generation: 200 images
   - Advanced analytics
   - Priority support
   - Custom templates
   - Bulk scheduling

3. **Professional** - ₹5999/month
   - 2000 credits per month
   - Text generation: 4000 posts
   - With posting: 2000 posts
   - Image generation: 2000 images
   - Advanced analytics & insights
   - 24/7 priority support
   - Custom templates & branding
   - Bulk scheduling & automation
   - API access
   - Dedicated account manager

### Credit Packs (One-time)
1. **Starter Pack** - ₹500
   - 50 credits
   - Valid for 6 months

2. **Pro Pack** - ₹1000
   - 120 credits (20% bonus)
   - Valid for 12 months

3. **Enterprise Pack** - ₹2500
   - 350 credits (40% bonus)
   - Valid for 12 months
   - Priority support

## Credit Usage

### Content Generation
- Text only: 0.5 credits
- Text + Post to LinkedIn: 1 credit
- Text + Image generation: 1.5 credits
- Text + Image + Post: 2 credits

### Other Actions
- Image generation only: 1 credit
- Carousel creation: Free
- Scheduling posts: Free
- Auto-posting scheduled: 0.5 credits

## API Endpoints

### Payment Processing
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Webhook handler

### Subscription Management
- `GET /api/subscription/current` - Get current subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/reactivate` - Reactivate subscription

### Payment History
- `GET /api/payment/history` - Get payment history

### Credits
- `GET /api/billing/credits` - Get credit information
- `POST /api/billing/credits` - Update credits

## Components

### Frontend Components
1. **PaymentModal** (`components/payment-modal.tsx`)
   - Handles Razorpay checkout
   - Payment verification
   - Success/error states

2. **PaymentHistory** (`components/payment-history.tsx`)
   - Displays transaction history
   - Payment status tracking

3. **SubscriptionManager** (`components/subscription-manager.tsx`)
   - Manage current subscription
   - Cancel/reactivate subscriptions

### Billing Page
- Updated `app/dashboard/billing/page.tsx`
- Tabbed interface for subscriptions and credit packs
- Current status display
- Payment history integration

## Testing

### Test Mode
1. Use Razorpay test mode for development
2. Test cards available in Razorpay dashboard
3. Test webhook with ngrok for local development

### Test Cards
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002
- Expired: 4000 0000 0000 0069

## Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **Payment Verification**: Verify payments on both client and server
3. **Environment Variables**: Never expose secrets in client-side code
4. **Database Security**: Use proper indexes and validation
5. **Rate Limiting**: Implement rate limiting on payment endpoints

## Deployment Checklist

- [ ] Set up Razorpay account and get API keys
- [ ] Configure environment variables
- [ ] Set up webhook URL in Razorpay dashboard
- [ ] Test payment flow in test mode
- [ ] Verify webhook handling
- [ ] Test subscription management
- [ ] Monitor payment logs
- [ ] Set up error monitoring

## Browser Compatibility

### Supported Browsers
Razorpay supports the following browsers:
- **Google Chrome**: Version 60 or higher
- **Mozilla Firefox**: Version 60 or higher
- **Safari**: Version 12 or higher
- **Microsoft Edge**: Version 79 or higher

### Browser Detection
The application automatically detects browser compatibility and shows warnings for unsupported browsers.

### Test Browser Compatibility
Visit `/test-browser` to check if your browser supports Razorpay payments.

## Troubleshooting

### Common Issues
1. **Payment not processing**: Check Razorpay dashboard for errors
2. **Credits not added**: Verify webhook is working
3. **Subscription not updating**: Check subscription collection
4. **Webhook not receiving**: Verify webhook URL and secret
5. **Browser not supported**: Use a supported browser or check `/test-browser`

### Debug Steps
1. Check browser console for errors
2. Monitor server logs
3. Verify Razorpay dashboard
4. Check database collections
5. Test with Razorpay test mode

## Support

For payment-related issues:
1. Check Razorpay documentation
2. Review server logs
3. Verify webhook configuration
4. Test with sample data

For application issues:
1. Check component logs
2. Verify API responses
3. Test payment flow
4. Review error handling
