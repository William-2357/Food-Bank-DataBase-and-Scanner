# Creo Integration Guide

This guide explains how to connect the Food Bank Barcode Scanner API to Creo.

## API Specification for Creo

**File to use:** `openapi-creo.json`

This file has been specifically formatted for Creo's requirements:
- ✅ **Single path only**: `/api/barcode-scanner`
- ✅ **Single HTTP method**: `POST`
- ✅ **Creo-compatible schema**: All schemas are properly defined

## Step 1: Import OpenAPI Spec in Creo

1. Open your Creo project
2. Go to **API Integration** or **External APIs**
3. Click **Add New API** or **Import**
4. Choose **Import from OpenAPI Specification**
5. Upload or paste the contents of `openapi-creo.json`

## Step 2: Configure API Endpoint

The API will be available at:
```
https://food-bank-scanner-lo1v3b7ub-williams-projects-d0619cfa.vercel.app/api/barcode-scanner
```

## Step 3: Use the API in Creo

### Request Format

```json
{
  "barcode": "3017620422003",
  "action": "scan_and_save"
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "barcode": "3017620422003",
    "name": "Nutella",
    "brand": "Ferrero",
    "category": ["Spreads", "Nut spreads"],
    "calories": 539,
    "protein": 6.3,
    "fat": 30.9,
    "carbs": 57.5,
    "fiber": 0.0,
    "sugars": 56.3,
    "sodium": 0.042,
    "allergens": ["hazelnuts", "milk", "soy"],
    "image_url": "https://world.openfoodfacts.org/images/products/301/762/042/2003/front_en.4.400.jpg",
    "expiry_date": null,
    "quantity": 1,
    "location": null,
    "created_at": "2024-01-01T12:00:00Z"
  },
  "message": "Product scanned and saved successfully"
}
```

## Step 4: Example Creo Workflow

### Basic Implementation

1. **Create a text input field** for barcode entry
2. **Create a button** (e.g., "Scan Barcode")
3. **On button tap/click**:
   - Call the API endpoint
   - Pass the barcode from the input field
   - Set `action` to `"scan_and_save"`

### Displaying Results

The API returns comprehensive product data:
- **Display the image**: Use `image_url` in an Image component
- **Show product name**: Display `name` field
- **Show brand**: Display `brand` field
- **Display nutrition**: Show `calories`, `protein`, `fat`, `carbs`, etc.
- **Show allergens**: Display `allergens` array

## Error Handling

### Common Error Responses

**400 Bad Request** - Invalid barcode format:
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid barcode format. Must be 8-14 digits."
}
```

**404 Not Found** - Product not found:
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Product with barcode 123456789 not found in OpenFoodFacts."
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred."
}
```

### Error Handling in Creo

1. Check if `success` is `false`
2. Display the `message` to the user
3. Log the `error` type for debugging

## Testing the API

You can test the API using curl:

```bash
curl -X POST https://food-bank-scanner-lo1v3b7ub-williams-projects-d0619cfa.vercel.app/api/barcode-scanner \
  -H "Content-Type: application/json" \
  -d '{"barcode": "3017620422003", "action": "scan_and_save"}'
```

## Supported Barcodes

The API uses OpenFoodFacts database, which contains millions of products worldwide. Common supported barcode formats:
- EAN-13 (13 digits)
- UPC-A (12 digits)
- EAN-8 (8 digits)
- Code 128

## Notes

- All barcodes must be 8-14 digits
- The `action` field must be `"scan_and_save"` to save to database
- Product data is automatically saved to PostgreSQL database
- CORS is enabled for all origins
- The API is served over HTTPS

## Support

If you encounter any issues:
1. Verify the OpenAPI spec is properly formatted
2. Check that the barcode format is correct (8-14 digits)
3. Ensure the Vercel deployment is live
4. Check the Creo console for detailed error messages
