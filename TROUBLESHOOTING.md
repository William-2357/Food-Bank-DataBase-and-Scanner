# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend 500 Internal Server Error

**Problem**: Getting `INFO: 127.0.0.1:61697 - "GET /foods/ HTTP/1.1" 500 Internal Server Error`

**Solutions**:

#### Option A: Quick Setup with SQLite (Recommended)
```bash
cd backend
python setup.py
python main.py
```

#### Option B: Manual Setup
```bash
# 1. Install Python dependencies
cd backend
pip install -r requirements.txt

# 2. Create .env file
cp env.example .env
# Edit .env with your database settings

# 3. Set up database
python -c "from database import create_tables; create_tables()"

# 4. Start server
python main.py
```

### 2. Database Connection Issues

**If using PostgreSQL**:
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb food_tracking

# Update .env file
DATABASE_URL=postgresql://username:password@localhost:5432/food_tracking
```

**If using SQLite (easier)**:
```bash
# No additional setup needed - SQLite is included with Python
# Just run the setup script
cd backend
python setup.py
```

### 3. Frontend Connection Issues

**Problem**: Frontend can't connect to backend

**Solution**: Make sure both services are running:
```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend
npm run dev
```

### 4. CORS Issues

**Problem**: Browser blocks requests due to CORS

**Solution**: The backend is configured to allow all origins in development. If you still have issues:

1. Check that backend is running on port 8000
2. Check that frontend is running on port 3000
3. Verify the API URL in `utils/fetchOpenFoodData.ts`

### 5. Missing Dependencies

**Problem**: Import errors or missing modules

**Solution**:
```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
npm install
```

### 6. Port Conflicts

**Problem**: Port 8000 or 3000 already in use

**Solution**:
```bash
# Find what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports
# Backend: uvicorn main:app --port 8001
# Frontend: npm run dev -- -p 3001
```

## Testing the Setup

### 1. Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Get all foods
curl http://localhost:8000/foods/

# API documentation
open http://localhost:8000/docs
```

### 2. Test Frontend
```bash
# Start frontend
npm run dev

# Open in browser
open http://localhost:3000
```

### 3. Test Integration
1. Open http://localhost:3000
2. Click "Start Scanning"
3. Allow camera access
4. Scan a barcode or enter manually
5. Check if data appears and can be submitted

## Development Tips

### Backend Development
```bash
# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run with debug logging
DEBUG=True python main.py
```

### Frontend Development
```bash
# Run with debug logging
DEBUG=true npm run dev

# Check for TypeScript errors
npm run lint
```

### Database Management
```bash
# SQLite database file location
ls -la backend/food_tracking.db

# View database contents (SQLite)
sqlite3 backend/food_tracking.db
.tables
SELECT * FROM foods;
.quit
```

## Production Deployment

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# Frontend
NEXT_PUBLIC_API_URL=http://your-backend-url:8000
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Getting Help

1. **Check logs**: Look at terminal output for error messages
2. **API Documentation**: Visit http://localhost:8000/docs
3. **Browser Console**: Check for JavaScript errors
4. **Network Tab**: Check for failed requests

## Quick Commands

```bash
# Start everything
./start_all.sh

# Start just backend
./start_backend.sh

# Start just frontend
npm run dev

# Reset database
rm backend/food_tracking.db
python backend/setup.py

# Check if services are running
curl http://localhost:8000/health
curl http://localhost:3000
```
