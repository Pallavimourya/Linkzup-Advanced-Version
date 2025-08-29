# Image Search Setup Guide

This guide explains how to set up and use the enhanced image search functionality that supports multiple image sources.

## 🎯 Features

- **Multiple Image Sources**: Unsplash, Pexels, Pixabay, Google Images (Serp)
- **Source Selection**: Users can choose which API to search from
- **Fallback System**: Curated images when APIs fail
- **Error Handling**: Graceful degradation and user feedback
- **Integration**: Works across all content creation tools

## 🔑 Required API Keys

### 1. Unsplash API
- **Purpose**: High-quality stock photos
- **Setup**: 
  1. Go to [Unsplash Developers](https://unsplash.com/developers)
  2. Create an account and register your application
  3. Get your Access Key
- **Rate Limit**: 50 requests per hour (demo), 5000 requests per hour (production)

### 2. Pexels API
- **Purpose**: Free stock photos and videos
- **Setup**:
  1. Go to [Pexels API](https://www.pexels.com/api/)
  2. Create an account and get your API key
- **Rate Limit**: 200 requests per hour

### 3. Pixabay API
- **Purpose**: Free images and videos
- **Setup**:
  1. Go to [Pixabay API](https://pixabay.com/api/docs/)
  2. Create an account and get your API key
- **Rate Limit**: 5000 requests per hour

### 4. Serp API (Google Images)
- **Purpose**: Web search results for images
- **Setup**:
  1. Go to [Serp API](https://serpapi.com/)
  2. Create an account and get your API key
- **Rate Limit**: 100 searches per month (free), more with paid plans

## ⚙️ Environment Configuration

Add these variables to your `.env.local` file:

```env
# Image Search APIs (optional - fallback images will be used if not configured)
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
PEXELS_API_KEY=your-pexels-api-key
PIXABAY_API_KEY=your-pixabay-api-key
SERP_API_KEY=your-serp-api-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 🚀 How It Works

### Search Flow:
1. **User enters search query** (e.g., "business meeting")
2. **User selects image source** (All Sources, Unsplash, Pexels, etc.)
3. **API searches selected source(s)**:
   - If "All Sources": Searches all configured APIs in parallel
   - If specific source: Searches only that API
4. **Results are displayed** with source attribution
5. **User selects and applies image**

### Fallback System:
- If no API keys configured → Fallback images
- If API fails → Fallback images
- If no results found → Fallback images
- If network error → Fallback images

## 📱 User Interface

### Source Selection Options:
- **All Sources**: Searches across all available APIs
- **Unsplash**: High-quality stock photos
- **Pexels**: Free stock photos and videos
- **Pixabay**: Free images and videos
- **Google Images**: Web search results

### Features:
- **Search Input**: Enter any search term
- **Source Dropdown**: Choose preferred image source
- **Image Grid**: Preview images before selection
- **Apply Button**: Use selected image in content
- **Error Handling**: Clear feedback for any issues

## 🔧 API Endpoints

### Search Images
```
GET /api/images/search?query={search_term}&source={source}
```

**Parameters:**
- `query` (required): Search term
- `source` (optional): Image source (all, unsplash, pexels, pixabay, serp)

**Response:**
```json
{
  "results": [
    {
      "id": "image_id",
      "urls": {
        "regular": "https://...",
        "full": "https://..."
      },
      "alt_description": "Image description",
      "user": {
        "name": "Photographer name"
      }
    }
  ],
  "total": 20,
  "source": "unsplash",
  "query": "business"
}
```

### Upload Image
```
POST /api/images/upload
```

**Body:** FormData with image file

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "cloudinary_public_id"
}
```

## 🧪 Testing

### Test Page
Visit `/test-image-search` to test the image search functionality:

1. Enter a search term
2. Select an image source
3. Click search
4. View results and source information

### Manual Testing
Test each source individually:
- Search "business" with Unsplash
- Search "nature" with Pexels
- Search "technology" with Pixabay
- Search "office" with Google Images

## 🎨 Integration Points

### 1. AI Carousel
- Background image selection
- Image preview with remove option
- Saved with carousel projects

### 2. AI Post Generator
- Content image selection
- Image preview with remove option
- Saved with generated content

### 3. AI Articles
- Article image selection
- Image preview with remove option
- Saved with articles

## 🛠️ Troubleshooting

### Common Issues:

1. **"No images found"**
   - Check if API keys are configured
   - Verify API rate limits
   - Try different search terms

2. **"API search failed"**
   - Check API key validity
   - Verify network connectivity
   - Check API service status

3. **Images not loading**
   - Check image URLs in browser
   - Verify CORS settings
   - Check image hosting service

### Debug Steps:
1. Check browser console for errors
2. Verify API keys in environment
3. Test individual APIs
4. Check network requests in DevTools

## 📊 Performance

### Optimization:
- **Parallel API calls** when using "All Sources"
- **Image caching** via Cloudinary
- **Lazy loading** for image grids
- **Error boundaries** for graceful failures

### Rate Limits:
- Monitor API usage
- Implement caching if needed
- Consider paid plans for higher limits

## 🔒 Security

### Best Practices:
- **API keys** stored in environment variables
- **Input validation** for search queries
- **CORS configuration** for image sources
- **Rate limiting** to prevent abuse

### Privacy:
- **No user data** sent to image APIs
- **Search queries** not logged
- **Image URLs** only stored when selected

## 📈 Future Enhancements

### Potential Features:
- **Image filters** (size, color, orientation)
- **Advanced search** (date, license, etc.)
- **Image collections** (favorites, history)
- **AI-powered suggestions**
- **Bulk image download**

### Additional Sources:
- **Adobe Stock** (paid)
- **Shutterstock** (paid)
- **Getty Images** (paid)
- **Custom image libraries**

## 📞 Support

For issues or questions:
1. Check this documentation
2. Test with `/test-image-search`
3. Review browser console errors
4. Verify API configurations
5. Contact development team

---

**Note**: The image search functionality is designed to work even without API keys by providing fallback images. This ensures users always have access to image selection capabilities.
