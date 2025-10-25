# 🏪 Food Bank Barcode Scanner API

A serverless API for barcode scanning and food inventory management, designed for use with Creo and other mobile/web applications.

## 🚀 Features

- **Barcode Scanning**: Scan barcodes and retrieve product data from OpenFoodFacts
- **Food Inventory**: Manage food items with nutritional information
- **Serverless**: Deploy to Vercel with zero configuration
- **Creo Compatible**: Optimized for Creo mobile app development
- **PostgreSQL**: Scalable database storage

## 📡 API Endpoints

### Barcode Scanner API
**Endpoint**: `POST /api/barcode-scanner`

**Actions**:
- `scan`: Retrieve product data from OpenFoodFacts
- `save`: Save product data to database
- `scan_and_save`: Scan and save in one operation

**Request Body**:
```json
{
  "barcode": "123456789",
  "action": "scan_and_save"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "barcode": "123456789",
    "name": "Apple",
    "brand": "Fresh Farm",
    "category": ["Fruits"],
    "calories": 52,
    "protein": 0.3,
    "fat": 0.2,
    "carbs": 14,
    "fiber": 2.4,
    "sugars": 10.4,
    "sodium": 0.001,
    "allergens": [],
    "image_url": "https://...",
    "expiry_date": "2024-12-31",
    "quantity": 1,
    "location": null,
    "id": "uuid-here",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Product scanned and saved successfully"
}
```

### Food Inventory API
**Endpoint**: `GET /api/foods`

**Query Parameters**:
- `barcode`: Get foods by barcode
- `search`: Search foods by name/brand/category
- `limit`: Limit results (default: 100)
- `offset`: Pagination offset (default: 0)

**Examples**:
```
GET /api/foods
GET /api/foods?barcode=123456789
GET /api/foods?search=apple&limit=10
```

**Delete Operations**:
```
DELETE /api/foods?id=uuid-here
DELETE /api/foods?barcode=123456789
```

## 🛠️ Setup for Vercel

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
In your Vercel dashboard, add:
```
POSTGRES_URL=your_postgresql_connection_string
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

## 🗄️ Database Setup

### PostgreSQL Schema
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
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_foods_barcode ON foods(barcode);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
```

## 📱 Creo Integration

### Example Creo Usage
```javascript
// Scan barcode and save to database
async function scanAndSaveBarcode(barcode) {
  try {
    const response = await fetch('https://your-api.vercel.app/api/barcode-scanner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barcode: barcode,
        action: 'scan_and_save'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Product saved:', result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Scan error:', error);
    throw error;
  }
}

// Get all foods
async function getAllFoods() {
  try {
    const response = await fetch('https://your-api.vercel.app/api/foods');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Search foods
async function searchFoods(query) {
  try {
    const response = await fetch(`https://your-api.vercel.app/api/foods?search=${encodeURIComponent(query)}`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}
```

## 🔧 Local Development

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Run Locally
```bash
vercel dev
```

### 3. Test Endpoints
```bash
# Test barcode scanner
curl -X POST http://localhost:3000/api/barcode-scanner \
  -H "Content-Type: application/json" \
  -d '{"barcode": "123456789", "action": "scan"}'

# Test foods API
curl http://localhost:3000/api/foods
```

## 📊 Data Sources

- **OpenFoodFacts**: Product information and nutritional data
- **Barcode Validation**: Supports EAN-13, UPC-A, and other standard formats
- **Nutritional Data**: Calories, protein, fat, carbs, fiber, sugars, sodium
- **Dietary Information**: Vegan, vegetarian, gluten-free, etc.

## 🚀 Deployment

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
vercel --prod
```

## 🔒 Security

- CORS enabled for all origins
- Input validation for barcodes
- SQL injection protection
- Rate limiting (Vercel default)

## 📈 Performance

- Serverless functions scale automatically
- PostgreSQL connection pooling
- Cached OpenFoodFacts responses
- Optimized for mobile networks

## 🐛 Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable error message"
}
```

## 📝 License

MIT License - see LICENSE file for details.
