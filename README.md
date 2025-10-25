# Food Bank Barcode Scanner

A lightweight barcode scanner module for a food bank web app that can scan barcodes and retrieve nutritional information from the OpenFoodFacts API.

## Features

- **Barcode Scanning**: Uses webcam to scan barcodes with ZXing library
- **Manual Input**: Fallback option to manually enter barcode numbers
- **OpenFoodFacts Integration**: Fetches product data from the public OpenFoodFacts API
- **Nutritional Data**: Extracts comprehensive nutritional information
- **Backend Integration**: Submits data to backend API for storage
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive UI**: Clean, modern interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React + TypeScript + Next.js
- **Styling**: Tailwind CSS
- **Barcode Scanning**: @zxing/library
- **HTTP Client**: Fetch API
- **Backend**: Next.js API routes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with camera access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Start Scanning**: Click "Start Scanning" to activate your webcam
2. **Scan Barcode**: Point your camera at a product barcode
3. **Manual Input**: If scanning fails, enter the barcode manually
4. **Review Data**: Check the product information and nutritional data
5. **Submit**: Click "Submit to Backend" to save the data

## API Endpoints

### POST /api/food-intake

Submits product data to the backend for storage.

**Request Body:**
```json
{
  "barcode": "1234567890123",
  "product_name": "Example Food",
  "brand": "Example Brand",
  "categories": ["Snacks", "Chips"],
  "nutritional_values": {
    "calories": 250,
    "proteins": 4,
    "fat": 12,
    "carbohydrates": 30,
    "sugars": 10,
    "fiber": 2,
    "salt": 0.5
  },
  "labels": ["vegan", "gluten-free"],
  "image_url": "https://example.com/image.jpg",
  "expiration_date": null
}
```

## File Structure

```
├── components/
│   └── BarcodeScanner.tsx     # Barcode scanning component
├── pages/
│   ├── api/
│   │   └── food-intake.ts     # Backend API route
│   ├── _app.tsx               # Next.js app wrapper
│   └── index.tsx              # Main application page
├── types/
│   └── product.ts             # TypeScript interfaces
├── utils/
│   └── fetchOpenFoodData.ts   # OpenFoodFacts API integration
└── styles/
    └── globals.css            # Global styles
```

## Data Sources

- **OpenFoodFacts API**: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- Provides comprehensive product information including:
  - Product name and brand
  - Nutritional values (calories, proteins, fat, etc.)
  - Dietary labels (vegan, gluten-free, etc.)
  - Product images
  - Categories and ingredients

## Error Handling

The application handles various error scenarios:

- **Camera Access Denied**: Shows manual input option
- **Product Not Found**: Displays user-friendly message
- **API Errors**: Graceful fallback with error messages
- **Network Issues**: Retry mechanisms and clear error states

## Future Enhancements

- Database integration for persistent storage
- User authentication and authorization
- Batch scanning capabilities
- Export functionality for inventory management
- Mobile app version
- Offline mode with local storage

## Development

### Adding New Features

1. Create new components in the `components/` directory
2. Add API routes in `pages/api/`
3. Update TypeScript interfaces in `types/`
4. Add utility functions in `utils/`

### Testing

The application includes comprehensive error handling and can be tested with:

- Various barcode formats
- Network connectivity issues
- Camera permission scenarios
- Invalid barcode numbers

## License

This project is open source and available under the MIT License.
