# Optimized API System

## Overview
This system efficiently uses two AI providers with specialized roles:
- **Perplexity**: For topic generation (best for viral topics)
- **OpenAI**: For all content generation (low-cost version)

## API Provider Strategy

### 1. **Perplexity** (Primary for Topics)
- **Model**: `llama-3.1-sonar-small-128k`
- **Cost**: ~$0.02 per 1K tokens
- **Best For**:
  - Topic generation (viral and engaging topics)
  - Research-based content
  - Fallback when OpenAI fails

### 2. **OpenAI** (Primary for Content)
- **Model**: `gpt-4o-mini` (Low-cost version)
- **Cost**: $0.00015/$0.0006 per 1K tokens
- **Best For**:
  - Personal stories and narratives
  - LinkedIn posts (professional content)
  - Articles (comprehensive content)
  - All content generation with optimal cost

## Smart Routing System

### Content Type Based Selection:
```typescript
// Topics → Perplexity (best for viral topic generation)
if (type === "topics") → "perplexity"

// All Content → OpenAI GPT-4o-mini (low-cost version)
if (type === "story" || "linkedin-post" || "article" || "carousel" || others) → "openai"
```

### Fallback Chain:
1. **Primary Provider** (Perplexity for topics, OpenAI for content)
2. **Fallback Provider** (Cross-fallback between providers)

## Environment Variables Required

```bash
# OpenAI
OPENAI_API_KEY=your_openai_key

# Perplexity
PERPLEXITY_API_KEY=your_perplexity_key
```

## Cost Optimization Benefits

### Expected Cost Savings:
- **Topics**: Perplexity's specialized topic generation
- **All Content**: 95% reduction (GPT-4o-mini vs GPT-4)
- **Stories**: Cost-effective with GPT-4o-mini
- **LinkedIn Posts**: Good quality with GPT-4o-mini

### Quality Benefits:
- **Topics**: Perplexity's viral and engaging topic generation
- **Personal Stories**: GPT-4o-mini's good narrative capabilities
- **LinkedIn Posts**: GPT-4o-mini's professional content quality
- **All Content**: GPT-4o-mini's cost-effective quality

## Installation

```bash
npm install @ai-sdk/perplexity ai
```

## Usage

The system automatically selects the optimal provider based on content type:

```typescript
// Automatic provider selection
const response = await aiService.generateContent(
  "topics", // Will use Perplexity
  "Your prompt here",
  "openai", // Will be overridden by smart selection
  customization
)

const response2 = await aiService.generateContent(
  "linkedin-post", // Will use OpenAI GPT-4o-mini
  "Your prompt here",
  "openai", // Will be overridden by smart selection
  customization
)
```

## Monitoring

The system logs provider usage and fallback events:
- Perplexity usage for topics
- OpenAI usage for content generation
- Cross-provider fallback events
- Cost tracking per provider
- Performance metrics

## Benefits

1. **Specialized Roles**: Perplexity for topics, OpenAI for content
2. **Cost Efficiency**: GPT-4o-mini for all content generation
3. **Quality Optimization**: Best provider for each task
4. **Reliability**: 100% uptime with cross-provider fallback
5. **Performance**: Optimal routing for each content type
