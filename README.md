# 🍎 Food Bank Barcode Scanner API

A comprehensive barcode scanning and food inventory management system built for food banks. This project includes a React frontend, FastAPI backend, and Vercel deployment configuration with PostgreSQL database integration.

## 🌟 Features

- **📱 Barcode Scanning**: Webcam-based barcode scanning with manual input fallback
- **🔍 OpenFoodFacts Integration**: Automatic product data retrieval from OpenFoodFacts API
- **🗄️ Database Management**: Full CRUD operations with PostgreSQL
- **☁️ Vercel Deployment**: Serverless API deployment ready
- **📱 Mobile Ready**: Optimized for Creo mobile app integration
- **🔒 CORS Enabled**: Cross-origin request support
- **📊 OpenAPI 3.0**: Complete API documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- PostgreSQL (or Vercel Postgres)
- Git

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/William-2357/Food-Bank-DataBase-and-Scanner.git
   cd Food-Bank-DataBase-and-Scanner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd backend && pip install -r requirements.txt
   ```

3. **Set up database**:
   ```bash
   # For local development
   cd backend
   python setup.py
   ```

4. **Start the application**:
   ```bash
   # Terminal 1: Start backend
   cd backend && python main.py
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🏗️ Project Structure

```
Food-Bank-DataBase-and-Scanner/
├── 📁 api/                          # Vercel API routes
│   ├── barcode-scanner.js          # Barcode scanning endpoint
│   └── foods.js                    # Food inventory management
├── 📁 backend/                      # FastAPI backend
│   ├── main.py                     # FastAPI application
│   ├── models.py                   # SQLAlchemy models
│   ├── schemas.py                  # Pydantic schemas
│   ├── crud.py                     # Database operations
│   └── database.py                 # Database connection
├── 📁 components/                   # React components
│   └── BarcodeScanner.tsx          # Barcode scanner component
├── 📁 pages/                        # Next.js pages
│   ├── index.tsx                   # Main scanner page
│   └── api/                        # Next.js API routes
├── 📁 sql/                          # Database schema
│   └── schema.sql                  # PostgreSQL schema
├── 📁 types/                        # TypeScript definitions
│   └── product.ts                  # Product data types
├── 📁 utils/                        # Utility functions
│   └── fetchOpenFoodData.ts        # OpenFoodFacts integration
├── 📄 openapi.json                 # OpenAPI 3.0 specification
├── 📄 openapi-vercel.json          # Vercel-specific OpenAPI spec
├── 📄 vercel.json                  # Vercel configuration
└── 📄 package.json                 # Node.js dependencies
```

## 🔧 API Endpoints

### Barcode Scanner
- **POST** `/api/barcode-scanner` - Scan barcode and retrieve/save product data

### Food Inventory
- **GET** `/api/foods` - Retrieve food items with filtering
- **DELETE** `/api/foods` - Delete food items by ID or barcode

## 📱 Mobile Integration (Creo)

The API is optimized for mobile applications like Creo:

```javascript
// Example Creo integration
const API_BASE = 'https://your-app.vercel.app/api';

const scanBarcode = async (barcode) => {
  const response = await fetch(`${API_BASE}/barcode-scanner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode, action: 'scan_and_save' })
  });
  return response.json();
};
```

## ☁️ Vercel Deployment

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Set up Database

```bash
# Create Vercel Postgres database
vercel postgres create food-bank-db

# Run schema
psql "your-connection-string" -f sql/schema.sql
```

### 3. Configure Environment Variables

Set these in your Vercel dashboard:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`

## 📊 Database Schema

The system uses PostgreSQL with the following main table:

```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category JSONB,
  calories INTEGER,
  protein DECIMAL(10,2),
  fat DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fiber DECIMAL(10,2),
  sugars DECIMAL(10,2),
  sodium DECIMAL(10,2),
  allergens JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  expiry_date DATE,
  quantity INTEGER DEFAULT 1,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 Supported Barcode Formats

- **EAN-13**: 13-digit European Article Number
- **UPC-A**: 12-digit Universal Product Code  
- **UPC-E**: 8-digit Universal Product Code
- **Code 128**: Variable length barcode
- **QR Code**: 2D barcode support

## 📚 API Documentation

- **OpenAPI 3.0**: `openapi.json` and `openapi-vercel.json`
- **Swagger UI**: Available at `/docs` when running locally
- **Postman Collection**: `postman-collection.json`
- **ReDoc Config**: `redoc-config.yaml`

## 🛠️ Development

### Backend Development

```bash
cd backend
python main.py
```

### Frontend Development

```bash
npm run dev
```

### Testing

```bash
# Test API endpoints
curl -X POST http://localhost:8000/foods/ \
  -H "Content-Type: application/json" \
  -d '{"barcode": "123456789", "name": "Test Product"}'
```

## 📦 Dependencies

### Frontend
- Next.js 14.2.33
- React 18.2.0
- TypeScript 5.0.0
- @zxing/library (barcode scanning)
- Tailwind CSS (styling)

### Backend
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- PostgreSQL
- Pydantic 2.5.0
- Uvicorn (ASGI server)

### Vercel
- @vercel/postgres
- Vercel CLI
- Serverless functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the API documentation files
- **Issues**: Create an issue on GitHub
- **Email**: support@foodbank-scanner.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Integration with more food databases

## 🙏 Acknowledgments

- [OpenFoodFacts](https://world.openfoodfacts.org/) for product data
- [ZXing](https://github.com/zxing/zxing) for barcode scanning
- [Vercel](https://vercel.com/) for hosting platform
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework

---

**Built with ❤️ for food banks and community organizations**