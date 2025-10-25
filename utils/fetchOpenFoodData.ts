import { OpenFoodFactsProduct, ProcessedProduct } from '../types/product';

const OPENFOODFACTS_API_BASE = 'https://world.openfoodfacts.org/api/v0/product';

function isValidDate(dateString: string): boolean {
  // Check if the date string is in YYYY-MM-DD format and is a valid date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString;
}

export async function fetchProductData(barcode: string): Promise<ProcessedProduct | null> {
  try {
    const response = await fetch(`${OPENFOODFACTS_API_BASE}/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 0 || !data.product) {
      return null; // Product not found
    }
    
    const product: OpenFoodFactsProduct = data.product;
    
    return processProductData(product);
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw new Error('Failed to fetch product data from OpenFoodFacts');
  }
}

function processProductData(product: OpenFoodFactsProduct): ProcessedProduct {
  const processed: ProcessedProduct = {
    barcode: product.code,
  };
  
  // Basic product info
  if (product.product_name) {
    processed.product_name = product.product_name;
  }
  
  if (product.brands) {
    processed.brand = product.brands;
  }
  
  if (product.categories) {
    processed.categories = product.categories.split(',').map(cat => cat.trim());
  }
  
  // Nutritional values
  if (product.nutriments) {
    const nutriments = product.nutriments;
    processed.nutritional_values = {};
    
    if (nutriments['energy-kcal_100g']) {
      processed.nutritional_values.calories = nutriments['energy-kcal_100g'];
    }
    if (nutriments['proteins_100g']) {
      processed.nutritional_values.proteins = nutriments['proteins_100g'];
    }
    if (nutriments['fat_100g']) {
      processed.nutritional_values.fat = nutriments['fat_100g'];
    }
    if (nutriments['carbohydrates_100g']) {
      processed.nutritional_values.carbohydrates = nutriments['carbohydrates_100g'];
    }
    if (nutriments['sugars_100g']) {
      processed.nutritional_values.sugars = nutriments['sugars_100g'];
    }
    if (nutriments['fiber_100g']) {
      processed.nutritional_values.fiber = nutriments['fiber_100g'];
    }
    if (nutriments['salt_100g']) {
      processed.nutritional_values.salt = nutriments['salt_100g'];
    }
  }
  
  // Labels (dietary constraints)
  if (product.labels_tags && product.labels_tags.length > 0) {
    processed.labels = product.labels_tags
      .filter(tag => tag.startsWith('en:'))
      .map(tag => tag.replace('en:', '').replace(/-/g, ' '))
      .filter(label => 
        ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'organic', 'fair-trade'].includes(label.toLowerCase())
      );
  }
  
  // Image URL
  if (product.image_url) {
    processed.image_url = product.image_url;
  } else if (product.image_front_url) {
    processed.image_url = product.image_front_url;
  }
  
  // Expiration date - only include if it's a valid date
  if (product.expiration_date && isValidDate(product.expiration_date)) {
    processed.expiration_date = product.expiration_date;
  }
  
  return processed;
}

export async function submitToBackend(productData: ProcessedProduct): Promise<boolean> {
  try {
    // Map our frontend data structure to the FastAPI backend schema
    const backendData = {
      barcode: productData.barcode,
      name: productData.product_name || 'Unknown Product',
      brand: productData.brand,
      category: productData.categories?.[0], // Use first category
      calories: productData.nutritional_values?.calories ? Math.round(productData.nutritional_values.calories) : undefined,
      protein: productData.nutritional_values?.proteins,
      fat: productData.nutritional_values?.fat,
      carbs: productData.nutritional_values?.carbohydrates,
      fiber: productData.nutritional_values?.fiber,
      sugars: productData.nutritional_values?.sugars,
      sodium: productData.nutritional_values?.salt,
      allergens: productData.labels || [],
      // Only send expiry_date if it's a valid date string (YYYY-MM-DD format)
      ...(productData.expiration_date && isValidDate(productData.expiration_date) && { expiry_date: productData.expiration_date }),
      quantity: 1, // Default quantity for new items
    };

    console.log('Submitting to backend:', backendData);

    const response = await fetch('/api/barcode-scanner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barcode: productData.barcode,
        action: 'scan_and_save'
      }),
    });
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        
        // Handle different error formats
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Validation errors
            const validationErrors = errorData.detail.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ');
            errorMessage += `, validation errors: ${validationErrors}`;
          } else {
            errorMessage += `, message: ${errorData.detail}`;
          }
        } else if (errorData.message) {
          errorMessage += `, message: ${errorData.message}`;
        } else {
          errorMessage += `, response: ${JSON.stringify(errorData)}`;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage += ', unable to parse error response';
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log('Backend success response:', responseData);
    console.log('Created new food item');
    
    return true;
  } catch (error) {
    console.error('Error submitting to backend:', error);
    throw new Error(`Failed to submit product data to backend: ${error.message}`);
  }
}
