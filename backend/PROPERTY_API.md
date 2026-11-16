# Property Listing System API

## Overview
Complete property management system with advanced search, filtering, image upload, and amenity management.

## 🚀 Quick Start

1. **Setup Database**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

2. **Start Server**
```bash
npm run dev
```

3. **Test API**
```bash
node test-api.js
```

## 📋 API Endpoints

### Properties

#### GET /api/properties
Get all properties with advanced search and filtering.

**Query Parameters:**
- `location` - Search by city, state, country, or address
- `checkIn` - Check-in date (YYYY-MM-DD)
- `checkOut` - Check-out date (YYYY-MM-DD)
- `guests` - Number of guests
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `type` - Property type (APARTMENT, HOUSE, VILLA, UNIQUE_STAY)
- `amenities` - Comma-separated amenity IDs
- `sortBy` - Sort by (price, rating, newest)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /api/properties?location=New York&guests=2&minPrice=100&maxPrice=300&amenities=wifi-id,kitchen-id
```

#### GET /api/properties/:id
Get detailed property information including reviews and ratings.

#### POST /api/properties
Create a new property (HOST/ADMIN only).

**Body:**
```json
{
  "title": "Luxury Downtown Apartment",
  "description": "Beautiful modern apartment...",
  "type": "APARTMENT",
  "price": 150.00,
  "bedrooms": 2,
  "bathrooms": 2,
  "maxGuests": 4,
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "country": "United States",
  "zipCode": "10001",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "amenityIds": ["amenity-id-1", "amenity-id-2"]
}
```

#### PUT /api/properties/:id
Update property (Owner/ADMIN only).

#### DELETE /api/properties/:id
Soft delete property (Owner/ADMIN only).

#### GET /api/properties/:id/availability
Check property availability for date range.

**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

#### GET /api/properties/host/:hostId
Get all properties by host (Owner/ADMIN only).

### Property Images

#### POST /api/properties/:propertyId/images
Upload property images (Owner/ADMIN only).

**Form Data:**
- `images` - Array of image files (max 10, 10MB each)
- `image_0` - JSON metadata for first image: `{"altText": "...", "isPrimary": true}`

#### PUT /api/properties/:propertyId/images/:imageId
Update image metadata (Owner/ADMIN only).

#### DELETE /api/properties/:propertyId/images/:imageId
Delete property image (Owner/ADMIN only).

#### PUT /api/properties/:propertyId/images/reorder
Reorder property images (Owner/ADMIN only).

**Body:**
```json
{
  "imageOrders": [
    {"id": "image-id-1", "order": 0},
    {"id": "image-id-2", "order": 1}
  ]
}
```

### Amenities

#### GET /api/properties/amenities/all
Get all available amenities.

**Query Parameters:**
- `category` - Filter by category

#### POST /api/properties/amenities
Create amenity (ADMIN only).

#### PUT /api/properties/amenities/:id
Update amenity (ADMIN only).

#### DELETE /api/properties/amenities/:id
Delete amenity (ADMIN only).

## 🔐 Authentication

Most endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🏷️ Property Types
- `APARTMENT` - Apartment or condo
- `HOUSE` - Entire house
- `VILLA` - Luxury villa
- `UNIQUE_STAY` - Unique accommodations

## 🎯 Search Features

### Location Search
Searches across:
- City names
- State/Province
- Country
- Street addresses

### Date Availability
Automatically filters out properties with conflicting bookings.

### Advanced Filtering
- Price range
- Property type
- Guest capacity
- Amenities (multiple selection)
- Ratings

### Sorting Options
- `price` - Price ascending
- `rating` - Rating descending
- `newest` - Recently added

## 📊 Response Format

### Property List Response
```json
{
  "properties": [
    {
      "id": "property-id",
      "title": "Property Title",
      "description": "Description...",
      "type": "APARTMENT",
      "price": 150.00,
      "bedrooms": 2,
      "bathrooms": 2,
      "maxGuests": 4,
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "United States",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "avgRating": 4.8,
      "host": {
        "id": "host-id",
        "firstName": "John",
        "lastName": "Doe"
      },
      "images": [...],
      "amenities": [...],
      "_count": {
        "reviews": 25,
        "bookings": 100
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Property Detail Response
```json
{
  "id": "property-id",
  "title": "Property Title",
  // ... all property fields
  "avgRating": 4.8,
  "ratingBreakdown": {
    "cleanliness": 4.9,
    "accuracy": 4.7,
    "checkIn": 4.8,
    "communication": 4.9,
    "location": 4.6,
    "value": 4.5
  },
  "reviews": [
    {
      "id": "review-id",
      "rating": 5,
      "comment": "Amazing place!",
      "guest": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🖼️ Image Upload

### Cloudinary Integration
- Automatic image optimization
- WebP format conversion
- Responsive image generation
- CDN delivery

### Image Constraints
- Max 20 images per property
- Max 10MB per image
- Supported formats: JPEG, PNG, WebP
- Auto-resize to 1200x800px

### Image Management
- Primary image selection
- Custom ordering
- Alt text for accessibility
- Automatic cleanup on deletion

## 🔍 Error Handling

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "price",
      "message": "Price must be positive"
    }
  ]
}
```

### Authorization Errors (403)
```json
{
  "error": "Not authorized to update this property"
}
```

### Not Found Errors (404)
```json
{
  "error": "Property not found"
}
```

## 🧪 Testing

### Sample Test Accounts
- **Admin:** admin@stayora.com / password123
- **Host 1:** host1@stayora.com / password123
- **Host 2:** host2@stayora.com / password123
- **Guest:** guest@stayora.com / password123

### Test Data
- 30+ amenities across categories
- 3 sample properties with different types
- Sample bookings and reviews
- Realistic location data with coordinates

## 🚀 Performance Features

### Database Optimization
- Indexed search fields (city, country, type, price)
- Geospatial indexing for location queries
- Efficient pagination
- Optimized joins and relations

### Caching Strategy
- Property list caching
- Image CDN caching
- Search result caching (recommended)

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## 🔧 Configuration

### Environment Variables
```env
# Cloudinary (for image upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
```

## 📈 Next Steps

1. **Frontend Integration** - Connect with Next.js frontend
2. **Map Integration** - Add Mapbox/Google Maps
3. **Real-time Features** - WebSocket for live availability
4. **Advanced Search** - Elasticsearch integration
5. **Analytics** - Property performance tracking
6. **Notifications** - Booking confirmations and updates