import React, { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import { fetchProductData, submitToBackend } from '../utils/fetchOpenFoodData';
import { ProcessedProduct } from '../types/product';

export default function Home() {
  const [scannedProduct, setScannedProduct] = useState<ProcessedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBarcodeDetected = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setScannedProduct(null);

    try {
      console.log('Barcode detected:', barcode);
      
      // Fetch product data from OpenFoodFacts
      const productData = await fetchProductData(barcode);
      
      if (!productData) {
        setError('Product not found in OpenFoodFacts database. Please try a different barcode.');
        return;
      }

      setScannedProduct(productData);
    } catch (err) {
      console.error('Error fetching product data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToBackend = async () => {
    if (!scannedProduct) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await submitToBackend(scannedProduct);
      setSuccess('Product successfully added to the system!');
      setScannedProduct(null); // Clear the product to allow new scans
    } catch (err) {
      console.error('Error submitting to backend:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit product data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = () => {
    setScannedProduct(null);
    setError(null);
    setSuccess(null);
  };

  const handleScannerError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Food Bank Barcode Scanner
          </h1>
          <p className="text-gray-600">
            Scan or enter a barcode to retrieve product information and record it in the system.
          </p>
        </div>

        {/* Scanner Component */}
        <div className="mb-8">
          <BarcodeScanner 
            onBarcodeDetected={handleBarcodeDetected}
            onError={handleScannerError}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {scannedProduct ? 'Submitting to backend...' : 'Fetching product data...'}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Product Information Card */}
        {scannedProduct && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Product Information</h2>
              <button
                onClick={handleRescan}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Rescan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              {scannedProduct.image_url && (
                <div className="flex justify-center">
                  <img
                    src={scannedProduct.image_url}
                    alt={scannedProduct.product_name || 'Product image'}
                    className="max-w-full h-48 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {scannedProduct.product_name || 'Unknown Product'}
                  </h3>
                  {scannedProduct.brand && (
                    <p className="text-gray-600">Brand: {scannedProduct.brand}</p>
                  )}
                  {scannedProduct.categories && scannedProduct.categories.length > 0 && (
                    <p className="text-gray-600">
                      Categories: {scannedProduct.categories.join(', ')}
                    </p>
                  )}
                </div>

                {/* Nutritional Information */}
                {scannedProduct.nutritional_values && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Nutritional Information (per 100g)</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {scannedProduct.nutritional_values.calories && (
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span>{scannedProduct.nutritional_values.calories} kcal</span>
                        </div>
                      )}
                      {scannedProduct.nutritional_values.proteins && (
                        <div className="flex justify-between">
                          <span>Proteins:</span>
                          <span>{scannedProduct.nutritional_values.proteins}g</span>
                        </div>
                      )}
                      {scannedProduct.nutritional_values.fat && (
                        <div className="flex justify-between">
                          <span>Fat:</span>
                          <span>{scannedProduct.nutritional_values.fat}g</span>
                        </div>
                      )}
                      {scannedProduct.nutritional_values.carbohydrates && (
                        <div className="flex justify-between">
                          <span>Carbs:</span>
                          <span>{scannedProduct.nutritional_values.carbohydrates}g</span>
                        </div>
                      )}
                      {scannedProduct.nutritional_values.sugars && (
                        <div className="flex justify-between">
                          <span>Sugars:</span>
                          <span>{scannedProduct.nutritional_values.sugars}g</span>
                        </div>
                      )}
                      {scannedProduct.nutritional_values.fiber && (
                        <div className="flex justify-between">
                          <span>Fiber:</span>
                          <span>{scannedProduct.nutritional_values.fiber}g</span>
                        </div>
                      )}
                      {scannedProduct.nutritional_values.salt && (
                        <div className="flex justify-between">
                          <span>Salt:</span>
                          <span>{scannedProduct.nutritional_values.salt}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dietary Labels */}
                {scannedProduct.labels && scannedProduct.labels.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                      {scannedProduct.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expiration Date */}
                {scannedProduct.expiration_date && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Expiration Date</h4>
                    <p className="text-gray-600">{scannedProduct.expiration_date}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSubmitToBackend}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Submit to Backend'}
              </button>
              <button
                onClick={handleRescan}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Scan Another Item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
