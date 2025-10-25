const { sql } = require('@vercel/postgres');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed', 
      message: 'Only POST method is allowed' 
    });
  }

  try {
    const { barcode, action = 'scan' } = req.body;

    // Validate barcode
    if (!barcode || !/^[0-9]{8,14}$/.test(barcode)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid barcode format. Must be 8-14 digits.'
      });
    }

    // Fetch product data from OpenFoodFacts
    const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await axios.get(openFoodFactsUrl);
    
    if (response.data.status === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Product not found in OpenFoodFacts database'
      });
    }

    const product = response.data.product;
    
    // Process product data
    const processedProduct = {
      id: uuidv4(),
      barcode: barcode,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || null,
      category: product.categories ? product.categories.split(',').map(c => c.trim()) : null,
      calories: product.nutriments?.['energy-kcal_100g'] ? Math.round(product.nutriments['energy-kcal_100g']) : null,
      protein: product.nutriments?.['proteins_100g'] || null,
      fat: product.nutriments?.['fat_100g'] || null,
      carbs: product.nutriments?.['carbohydrates_100g'] || null,
      fiber: product.nutriments?.['fiber_100g'] || null,
      sugars: product.nutriments?.['sugars_100g'] || null,
      sodium: product.nutriments?.['sodium_100g'] || null,
      allergens: product.labels_tags || [],
      image_url: product.image_url || null,
      expiry_date: product.expiration_date || null,
      quantity: 1,
      location: null,
      created_at: new Date().toISOString()
    };

    // Save to database if action includes 'save'
    if (action === 'save' || action === 'scan_and_save') {
      try {
        await sql`
          INSERT INTO foods (
            id, barcode, name, brand, category, calories, protein, fat, carbs, 
            fiber, sugars, sodium, allergens, image_url, expiry_date, quantity, 
            location, created_at
          ) VALUES (
            ${processedProduct.id}, ${processedProduct.barcode}, ${processedProduct.name}, 
            ${processedProduct.brand}, ${JSON.stringify(processedProduct.category)}, 
            ${processedProduct.calories}, ${processedProduct.protein}, ${processedProduct.fat}, 
            ${processedProduct.carbs}, ${processedProduct.fiber}, ${processedProduct.sugars}, 
            ${processedProduct.sodium}, ${JSON.stringify(processedProduct.allergens)}, 
            ${processedProduct.image_url}, ${processedProduct.expiry_date}, 
            ${processedProduct.quantity}, ${processedProduct.location}, ${processedProduct.created_at}
          )
        `;
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database Error',
          message: 'Failed to save product to database'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: processedProduct,
      message: action.includes('save') ? 'Product scanned and saved successfully' : 'Product scanned successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing the request'
    });
  }
}