import { NextApiRequest, NextApiResponse } from 'next';
import { FoodIntakeRequest } from '../../types/product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const productData: FoodIntakeRequest = req.body;

    // Validate required fields
    if (!productData.barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Log the received data (for now, since database is not implemented)
    console.log('Received food intake data:', {
      timestamp: new Date().toISOString(),
      barcode: productData.barcode,
      product_name: productData.product_name,
      brand: productData.brand,
      categories: productData.categories,
      nutritional_values: productData.nutritional_values,
      labels: productData.labels,
      image_url: productData.image_url,
      expiration_date: productData.expiration_date,
    });

    // TODO: Store in database when implemented
    // Example database operations:
    // await db.foodItems.create({
    //   data: {
    //     barcode: productData.barcode,
    //     productName: productData.product_name,
    //     brand: productData.brand,
    //     categories: productData.categories,
    //     nutritionalValues: productData.nutritional_values,
    //     labels: productData.labels,
    //     imageUrl: productData.image_url,
    //     expirationDate: productData.expiration_date,
    //     createdAt: new Date(),
    //   }
    // });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Food item recorded successfully',
      data: {
        barcode: productData.barcode,
        product_name: productData.product_name,
        recorded_at: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error processing food intake:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process food intake data'
    });
  }
}
