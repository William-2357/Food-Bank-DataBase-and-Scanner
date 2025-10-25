# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **PostgreSQL Database**: Set up a PostgreSQL database (Vercel Postgres recommended)

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

1. **Create Vercel Postgres Database**:
   ```bash
   vercel postgres create food-bank-db
   ```

2. **Get Connection String**:
   ```bash
   vercel postgres connect food-bank-db
   ```

3. **Run Schema**:
   ```bash
   # Copy the connection string and run:
   psql "your-connection-string" -f sql/schema.sql
   ```

### Option 2: External PostgreSQL

1. **Set Environment Variables**:
   ```bash
   vercel env add POSTGRES_URL
   vercel env add POSTGRES_PRISMA_URL
   vercel env add POSTGRES_URL_NON_POOLING
   vercel env add POSTGRES_USER
   vercel env add POSTGRES_HOST
   vercel env add POSTGRES_PASSWORD
   vercel env add POSTGRES_DATABASE
   ```

## 🚀 Deployment Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Set Environment Variables

```bash
# Set your database URL
vercel env add POSTGRES_URL "your-postgres-connection-string"

# Add other required environment variables
vercel env add POSTGRES_PRISMA_URL "your-postgres-connection-string"
vercel env add POSTGRES_URL_NON_POOLING "your-postgres-connection-string"
```

### 4. Redeploy with Environment Variables

```bash
vercel --prod
```

## 🔧 Configuration Files

### `vercel.json`
- Configures serverless functions
- Sets up routing
- Defines environment variables
- Sets function timeouts

### `package.json`
- Updated with Next.js dependencies
- Vercel-specific build scripts
- Required dependencies for API functions

### API Routes

#### `/api/barcode-scanner.js`
- Handles barcode scanning
- Integrates with OpenFoodFacts
- Saves to PostgreSQL database
- CORS enabled

#### `/api/foods.js`
- Food inventory management
- GET: Retrieve foods with filtering
- DELETE: Remove foods by ID or barcode
- CORS enabled

## 🌐 API Endpoints

After deployment, your API will be available at:

```
https://your-app.vercel.app/api/barcode-scanner
https://your-app.vercel.app/api/foods
```

### Example Usage

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

// Get all foods
const foods = await fetch('https://your-app.vercel.app/api/foods')
  .then(res => res.json());
```

## 🔍 Testing

### 1. Test API Endpoints

```bash
# Test barcode scanner
curl -X POST https://your-app.vercel.app/api/barcode-scanner \
  -H "Content-Type: application/json" \
  -d '{"barcode": "123456789", "action": "scan"}'

# Test foods endpoint
curl https://your-app.vercel.app/api/foods
```

### 2. Test Frontend

Visit your deployed URL and test the barcode scanner interface.

## 📱 Creo Integration

### 1. Update API URLs

In your Creo app, update the API base URL:

```javascript
const API_BASE_URL = 'https://your-app.vercel.app/api';
```

### 2. Test Integration

```javascript
// Example Creo integration
const scanBarcode = async (barcode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/barcode-scanner`, {
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
    return result;
  } catch (error) {
    console.error('Error scanning barcode:', error);
    throw error;
  }
};
```

## 🔧 Environment Variables

Required environment variables:

```bash
POSTGRES_URL=postgresql://user:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://user:password@host:port/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:port/database
POSTGRES_USER=username
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database_name
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check environment variables
   - Verify database is accessible
   - Run schema.sql to create tables

2. **CORS Issues**:
   - API routes have CORS headers configured
   - Check browser console for errors

3. **Function Timeouts**:
   - Barcode scanner has 30s timeout
   - Foods endpoint has 10s timeout

### Debug Commands

```bash
# Check deployment logs
vercel logs

# Check environment
vercel env ls

# Test locally
vercel dev
```

## 📊 Monitoring

### Vercel Dashboard
- Monitor function executions
- Check error rates
- View performance metrics

### Database Monitoring
- Monitor query performance
- Check connection usage
- Set up alerts for errors

## 🔄 Updates

To update your deployment:

```bash
# Make changes to your code
git add .
git commit -m "Update API"

# Redeploy
vercel --prod
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)

## 🎯 Next Steps

1. **Deploy to Vercel**: Follow the deployment steps above
2. **Test API**: Use the testing commands
3. **Integrate with Creo**: Update your mobile app
4. **Monitor**: Set up monitoring and alerts
5. **Scale**: Optimize for production usage
