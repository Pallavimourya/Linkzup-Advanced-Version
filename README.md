# Linkzup - Advanced LinkedIn Content Generation

A comprehensive LinkedIn content generation platform powered by AI.

## Features

- **AI-Powered Content Generation**: Generate LinkedIn posts, articles, carousels, and more using OpenAI GPT-4
- **Multi-Provider Support**: OpenAI (primary) and Perplexity AI (fallback)
- **Content Customization**: Tone, language, word count, target audience, and more
- **Queue Management**: Efficient request queuing with real-time status
- **Credit System**: Track and manage AI usage costs
- **LinkedIn Integration**: Direct posting and scheduling capabilities
- **User Authentication**: Secure user management with NextAuth.js

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# AI Service API Keys
OPENAI_API_KEY=your_openai_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# LinkedIn API (optional)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## AI Content Generation

### Supported Content Types

- **LinkedIn Posts**: Generate 6 unique, professional posts
- **Articles**: Comprehensive articles on any topic
- **Topics**: Viral-worthy topic suggestions
- **Carousels**: Multi-slide LinkedIn carousel content
- **Stories**: Personal, relatable stories
- **Lists**: Numbered list content
- **Quotes**: Inspirational quote posts
- **Before/After**: Transformation content
- **Tips**: Actionable tips and advice
- **Insights**: Deep analysis content
- **Questions**: Discussion-starting questions

### Customization Options

- **Tone**: Professional, casual, friendly, authoritative, conversational, inspirational
- **Language**: Any language (default: English)
- **Word Count**: Configurable content length
- **Target Audience**: Specific audience targeting
- **Main Goal**: Engagement, awareness, conversion, education, entertainment
- **Content Features**: Hashtags, emojis, call-to-action toggles

### API Usage

#### Generate Content

```typescript
POST /api/ai/generate

{
  "type": "linkedin-post",
  "prompt": "Digital marketing strategies",
  "provider": "openai",
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

#### Check Queue Status

```typescript
GET /api/ai/generate
```

## AI Providers

### OpenAI GPT-4 (Primary)
- **Pros**: High quality, consistent output, advanced reasoning
- **Cons**: Higher cost, slower response times
- **Best for**: Professional content, complex topics, high-quality articles
- **Cost**: ~$0.03 per 1K prompt tokens, ~$0.06 per 1K completion tokens

### Perplexity AI (Fallback)
- **Pros**: Lower cost, faster response times, real-time information
- **Cons**: Variable quality, less consistent formatting
- **Best for**: Quick content, cost-sensitive operations, real-time topics
- **Cost**: ~$0.02 per 1K tokens

## Architecture

- **Frontend**: Next.js 14 with React 18
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **AI Service**: OpenAI GPT-4 + Perplexity AI
- **Styling**: Tailwind CSS + shadcn/ui
- **Image Storage**: Cloudinary

## File Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── ai/           # AI generation endpoints
│   ├── dashboard/        # Dashboard pages
│   └── auth/            # Authentication pages
├── components/           # React components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── ai-service.ts    # AI service implementation
│   ├── openai.ts        # OpenAI integration
│   └── auth.ts          # Authentication setup
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

## Getting OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the sidebar
4. Click "Create new secret key"
5. Copy the generated key and add it to your `.env.local` file

## Getting Perplexity API Key (Optional)

1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Add it to your `.env.local` file

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.

