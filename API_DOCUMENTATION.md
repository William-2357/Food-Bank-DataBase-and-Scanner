# 📚 Food Bank Barcode Scanner API Documentation

## 🚀 API Overview

The Food Bank Barcode Scanner API provides comprehensive functionality for:
- **Barcode Scanning**: Retrieve product data from OpenFoodFacts
- **Food Inventory Management**: Full CRUD operations for food items
- **Nutritional Data**: Complete nutritional information and allergen data
- **Duplicate Support**: Allow multiple entries of the same barcode

## 📡 Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

## 🔑 Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## 📋 Endpoints

### 1. Barcode Scanner

#### `POST /barcode-scanner`

Scan a barcode and retrieve/save product data.

**Request Body:**
```json
{
  "barcode": "123456789",
  "action": "scan_and_save"
}
```

**Actions:**
- `scan` - Retrieve product data only
- `save` - Save product to database (requires existing data)
- `scan_and_save` - Scan and save in one operation

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "barcode": "123456789",
    "name": "Organic Apple",
    "brand": "Fresh Farm",
    "category": ["Fruits", "Organic"],
    "calories": 52,
    "protein": 0.3,
    "fat": 0.2,
    "carbs": 14.0,
    "fiber": 2.4,
    "sugars": 10.4,
    "sodium": 0.001,
    "allergens": ["vegan", "gluten-free"],
    "image_url": "https://world.openfoodfacts.org/images/products/123/456/789/front_en.4.400.jpg",
    "expiry_date": "2024-12-31",
    "quantity": 5,
    "location": "Fridge A",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "message": "Product scanned and saved successfully"
}
```

### 2. Food Inventory

#### `GET /foods`

Retrieve food items with optional filtering.

**Query Parameters:**
- `barcode` (string) - Filter by barcode
- `search` (string) - Search by name, brand, or category
- `limit` (integer) - Maximum results (default: 100, max: 1000)
- `offset` (integer) - Pagination offset (default: 0)

**Examples:**
```
GET /foods
GET /foods?barcode=123456789
GET /foods?search=apple&limit=10
GET /foods?search=organic&limit=50&offset=100
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "barcode": "123456789",
      "name": "Organic Apple",
      "brand": "Fresh Farm",
      "category": ["Fruits", "Organic"],
      "calories": 52,
      "protein": 0.3,
      "fat": 0.2,
      "carbs": 14.0,
      "fiber": 2.4,
      "sugars": 10.4,
      "sodium": 0.001,
      "allergens": ["vegan", "gluten-free"],
      "image_url": "https://world.openfoodfacts.org/images/products/123/456/789/front_en.4.400.jpg",
      "expiry_date": "2024-12-31",
      "quantity": 5,
      "location": "Fridge A",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1,
  "pagination": {
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

#### `DELETE /foods`

Delete food items by ID or barcode.

**Query Parameters:**
- `id` (string) - Delete by food ID
- `barcode` (string) - Delete all foods with this barcode

**Examples:**
```
DELETE /foods?id=550e8400-e29b-41d4-a716-446655440000
DELETE /foods?barcode=123456789
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 3 food items with barcode 123456789"
}
```

## 🚨 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Common Error Codes

- **400 Bad Request** - Invalid input parameters
- **404 Not Found** - Product not found in OpenFoodFacts
- **500 Internal Server Error** - Server-side error

## 📊 Data Sources

### OpenFoodFacts Integration

The API integrates with OpenFoodFacts to provide:
- **Product Information**: Name, brand, category
- **Nutritional Data**: Calories, protein, fat, carbs, fiber, sugars, sodium
- **Dietary Information**: Allergens, vegan, vegetarian, gluten-free, etc.
- **Product Images**: High-quality product photos
- **Expiry Dates**: When available

### Supported Barcode Formats

- **EAN-13**: 13-digit European Article Number
- **UPC-A**: 12-digit Universal Product Code
- **UPC-E**: 8-digit Universal Product Code
- **Code 128**: Variable length barcode
- **QR Code**: 2D barcode support

## 🔧 Rate Limiting

- **OpenFoodFacts API**: Respects their rate limits
- **Database Operations**: No specific limits
- **CORS**: Enabled for all origins

## 📱 Mobile Integration

### Creo Integration Example

```javascript
// Scan and save barcode
const response = await fetch('https://your-app.vercel.app/api/barcode-scanner', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    barcode: '123456789',
    action: 'scan_and_save'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Product saved:', result.data);
}
```

### React/Next.js Integration

```javascript
// Get all foods
const foods = await fetch('https://your-app.vercel.app/api/foods')
  .then(res => res.json())
  .then(data => data.data);

// Search foods
const searchResults = await fetch('https://your-app.vercel.app/api/foods?search=apple')
  .then(res => res.json())
  .then(data => data.data);
```

## 🗄️ Database Schema

### Foods Table

```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(255),
  calories INTEGER,
  protein DECIMAL(10,2),
  fat DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fiber DECIMAL(10,2),
  sugars DECIMAL(10,2),
  sodium DECIMAL(10,2),
  allergens JSONB,
  expiry_date DATE,
  quantity INTEGER DEFAULT 1,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```
   POSTGRES_URL=your_postgresql_connection_string
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev
```

## 📈 Performance

- **Serverless Functions**: Auto-scaling with Vercel
- **Database**: PostgreSQL with connection pooling
- **Caching**: OpenFoodFacts responses cached
- **CDN**: Global edge network

## 🔒 Security

- **CORS**: Enabled for all origins
- **Input Validation**: Barcode format validation
- **SQL Injection**: Protected with parameterized queries
- **Rate Limiting**: Respects OpenFoodFacts limits

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Support

For support and questions:
- **Email**: support@foodbank-scanner.com
- **Documentation**: This file
- **OpenAPI Spec**: `/openapi.json`
