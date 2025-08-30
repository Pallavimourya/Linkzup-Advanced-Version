# Image Management Setup Guide

## Overview
The AI Carousel now includes comprehensive image management functionality that allows users to:
- Upload images from their device
- Search images from multiple stock photo libraries
- Generate AI images using DALL-E
- Use images as carousel backgrounds

## Features

### 1. Image Upload
- **Supported formats**: JPG, PNG, GIF, WebP
- **Max file size**: 10MB
- **Storage**: Images are uploaded to Cloudinary
- **Optimization**: Automatic resizing and compression

### 2. Image Search
- **Unsplash**: High-quality stock photos
- **Pexels**: Free stock photos and videos
- **Pixabay**: Free images and videos
- **Google Images**: Via SerpAPI for comprehensive search

### 3. AI Image Generation
- **Model**: OpenAI DALL-E 3
- **Size**: 1024x1024 pixels
- **Style**: Natural, professional
- **Storage**: Generated images saved to Cloudinary

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# OpenAI for AI Image Generation
OPENAI_API_KEY=your-openai-api-key

# Image Search APIs
UNSPLASH_API_KEY=your-unsplash-api-key
PEXELS_API_KEY=your-pexels-api-key
PIXABAY_API_KEY=your-pixabay-api-key
SERP_API=your-serp-api-key
```

## API Endpoints

### 1. Upload Image
- **Endpoint**: `/api/upload-image`
- **Method**: POST
- **Body**: FormData with file
- **Response**: Cloudinary URL and metadata

### 2. Search Images
- **Endpoint**: `/api/search-images`
- **Method**: POST
- **Body**: JSON with query and source
- **Response**: Array of image results

### 3. Generate AI Image
- **Endpoint**: `/api/generate-image`
- **Method**: POST
- **Body**: JSON with prompt
- **Response**: Generated image URL

## Usage in AI Carousel

1. **Open the AI Carousel page**
2. **Select a slide** to edit
3. **Go to Background tab**
4. **Click "Image" tab**
5. **Click "Add Image" button**
6. **Choose from three options**:
   - **Upload**: Select files from your device
   - **Search**: Search stock photo libraries
   - **AI Generate**: Create images with AI

## Component Structure

### ImageManager Component
Located at: `components/image-manager.tsx`

**Props:**
- `onImageSelect`: Callback when image is selected
- `trigger`: Custom trigger element (optional)
- `className`: Additional CSS classes (optional)

**Features:**
- Modal dialog with tabs
- Drag and drop upload
- Multi-source search
- AI generation with prompts
- Image preview and selection

## Integration Points

### Carousel Slide Interface
```typescript
interface CarouselSlide {
  id: string
  text: string
  fontSize: number
  fontFamily: string
  textColor: string
  textPosition: { x: number; y: number }
  backgroundColor: string
  backgroundType: "color" | "gradient" | "image"
  backgroundImage?: string
}
```

### Background Types
- **color**: Solid color background
- **gradient**: Gradient background (future feature)
- **image**: Image background with URL

## Styling

### Background Image Properties
- **backgroundSize**: "cover" for full coverage
- **backgroundPosition**: "center" for centered positioning
- **backgroundRepeat**: "no-repeat" to prevent tiling

### Text Overlay
- Text is positioned over the background image
- Automatic contrast handling
- Draggable text positioning

## Error Handling

### Upload Errors
- File type validation
- File size limits
- Network errors
- Cloudinary upload failures

### Search Errors
- API key validation
- Rate limiting
- Network timeouts
- Empty results

### AI Generation Errors
- OpenAI API limits
- Content policy violations
- Billing issues
- Generation failures

## Performance Considerations

### Image Optimization
- Automatic resizing to 1200x1200 max
- Quality optimization
- Cloudinary transformations
- Lazy loading for search results

### Caching
- Cloudinary CDN for uploaded images
- Browser caching for search results
- Session storage for recent selections

## Security

### File Validation
- MIME type checking
- File size limits
- Malware scanning (Cloudinary)
- Secure upload endpoints

### API Security
- Server-side API calls
- Environment variable protection
- Rate limiting
- Error message sanitization

## Troubleshooting

### Common Issues

1. **Upload fails**
   - Check file size and type
   - Verify Cloudinary credentials
   - Check network connection

2. **Search returns no results**
   - Verify API keys
   - Check search query
   - Try different image sources

3. **AI generation fails**
   - Check OpenAI API key
   - Verify billing status
   - Review prompt content

4. **Images not displaying**
   - Check image URLs
   - Verify CORS settings
   - Clear browser cache

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- Image editing tools
- Background removal
- Custom filters and effects
- Batch upload
- Image collections
- Advanced AI prompts
- Image analytics

### Integration Opportunities
- LinkedIn post scheduling
- Social media automation
- Content calendar
- Team collaboration
- Brand guidelines
- Asset management

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify environment variables
3. Test API endpoints individually
4. Review Cloudinary and OpenAI documentation
5. Check rate limits and billing status
