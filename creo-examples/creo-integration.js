/**
 * Creo Integration Examples for Food Bank Barcode Scanner API
 * 
 * This file contains example code for integrating the barcode scanner API
 * with Creo mobile applications.
 */

// Base API URL - replace with your Vercel deployment URL
const API_BASE_URL = 'https://your-app.vercel.app/api';

/**
 * Scan a barcode and retrieve product information
 * @param {string} barcode - The barcode to scan
 * @returns {Promise<Object>} Product data from OpenFoodFacts
 */
async function scanBarcode(barcode) {
  try {
    const response = await fetch(`${API_BASE_URL}/barcode-scanner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barcode: barcode,
        action: 'scan'
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to scan barcode');
    }
    
    return result.data;
  } catch (error) {
    console.error('Barcode scan error:', error);
    throw error;
  }
}

/**
 * Scan a barcode and save the product to the database
 * @param {string} barcode - The barcode to scan
 * @returns {Promise<Object>} Saved product data
 */
async function scanAndSaveBarcode(barcode) {
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
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to scan and save barcode');
    }
    
    return result.data;
  } catch (error) {
    console.error('Scan and save error:', error);
    throw error;
  }
}

/**
 * Get all foods from the database
 * @param {number} limit - Maximum number of results (default: 100)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<Array>} Array of food items
 */
async function getAllFoods(limit = 100, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods?limit=${limit}&offset=${offset}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch foods');
    }
    
    return result.data;
  } catch (error) {
    console.error('Get foods error:', error);
    throw error;
  }
}

/**
 * Search foods by name, brand, or category
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results (default: 50)
 * @returns {Promise<Array>} Array of matching food items
 */
async function searchFoods(query, limit = 50) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods?search=${encodeURIComponent(query)}&limit=${limit}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to search foods');
    }
    
    return result.data;
  } catch (error) {
    console.error('Search foods error:', error);
    throw error;
  }
}

/**
 * Get foods by barcode
 * @param {string} barcode} - Barcode to search for
 * @returns {Promise<Array>} Array of food items with matching barcode
 */
async function getFoodsByBarcode(barcode) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods?barcode=${barcode}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch foods by barcode');
    }
    
    return result.data;
  } catch (error) {
    console.error('Get foods by barcode error:', error);
    throw error;
  }
}

/**
 * Delete a food item by ID
 * @param {string} id - Food item ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteFoodById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods?id=${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete food');
    }
    
    return result.success;
  } catch (error) {
    console.error('Delete food error:', error);
    throw error;
  }
}

/**
 * Delete all foods with a specific barcode
 * @param {string} barcode - Barcode to delete
 * @returns {Promise<number>} Number of items deleted
 */
async function deleteFoodsByBarcode(barcode) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods?barcode=${barcode}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete foods by barcode');
    }
    
    return result.message;
  } catch (error) {
    console.error('Delete foods by barcode error:', error);
    throw error;
  }
}

/**
 * Creo-specific helper functions
 */

/**
 * Format product data for Creo display
 * @param {Object} product - Product data from API
 * @returns {Object} Formatted product data for Creo
 */
function formatProductForCreo(product) {
  return {
    id: product.id,
    barcode: product.barcode,
    name: product.name,
    brand: product.brand || 'Unknown Brand',
    brand: product.brand,
    category: product.category,
    nutrition: {
      calories: product.calories || 0,
      protein: product.protein || 0,
      fat: product.fat || 0,
      carbs: product.carbs || 0,
      fiber: product.fiber || 0,
      sugars: product.sugars || 0,
      sodium: product.sodium || 0
    },
    allergens: product.allergens || [],
    imageUrl: product.image_url,
    expiryDate: product.expiry_date,
    quantity: product.quantity || 1,
    location: product.location,
    createdAt: product.created_at
  };
}

/**
 * Validate barcode format for Creo input
 * @param {string} barcode - Barcode to validate
 * @returns {boolean} Valid barcode format
 */
function isValidBarcodeForCreo(barcode) {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }
  
  // Remove any non-numeric characters
  const cleanBarcode = barcode.replace(/\D/g, '');
  
  // Check if it's a valid length (8-14 digits)
  return cleanBarcode.length >= 8 && cleanBarcode.length <= 14;
}

/**
 * Example Creo usage in a mobile app
 */
class FoodBankScanner {
  constructor() {
    this.apiBaseUrl = API_BASE_URL;
  }
  
  /**
   * Scan a barcode using Creo's camera functionality
   * This would integrate with Creo's barcode scanning capabilities
   */
  async scanBarcodeWithCamera() {
    try {
      // In Creo, you would use the camera to scan barcodes
      // This is a placeholder for the actual Creo camera integration
      const barcode = await this.getBarcodeFromCamera();
      
      if (!isValidBarcodeForCreo(barcode)) {
        throw new Error('Invalid barcode format');
      }
      
      const product = await scanAndSaveBarcode(barcode);
      return formatProductForCreo(product);
    } catch (error) {
      console.error('Camera scan error:', error);
      throw error;
    }
  }
  
  /**
   * Manual barcode entry for Creo
   */
  async scanBarcodeManually(barcode) {
    try {
      if (!isValidBarcodeForCreo(barcode)) {
      throw new Error('Invalid barcode format');
    }
    
    const product = await scanAndSaveBarcode(barcode);
    return formatProductForCreo(product);
    } catch (error) {
      console.error('Manual scan error:', error);
      throw error;
    }
  }
  
  /**
   * Get inventory for Creo display
   */
  async getInventory(limit = 50) {
    try {
      const foods = await getAllFoods(limit);
      return foods.map(formatProductForCreo);
    } catch (error) {
      console.error('Get inventory error:', error);
      throw error;
    }
  }
  
  /**
   * Search inventory for Creo
   */
  async searchInventory(query) {
    try {
      const foods = await searchFoods(query);
      return foods.map(formatProductForCreo);
    } catch (error) {
      console.error('Search inventory error:', error);
      throw error;
    }
  }
  
  /**
   * Placeholder for Creo camera integration
   * In actual Creo implementation, this would use the camera API
   */
  async getBarcodeFromCamera() {
    // This is where you would integrate with Creo's camera functionality
    // For now, return a sample barcode
    return '123456789';
  }
}

// Export functions for use in Creo
export {
  scanBarcode,
  scanAndSaveBarcode,
  getAllFoods,
  searchFoods,
  getFoodsByBarcode,
  deleteFoodById,
  deleteFoodsByBarcode,
  formatProductForCreo,
  isValidBarcodeForCreo,
  FoodBankScanner
};
