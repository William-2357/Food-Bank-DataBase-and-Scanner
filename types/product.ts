export interface NutritionalValues {
  calories?: number;
  proteins?: number;
  fat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  salt?: number;
}

export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  quantity?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'fat_100g'?: number;
    'carbohydrates_100g'?: number;
    'sugars_100g'?: number;
    'fiber_100g'?: number;
    'salt_100g'?: number;
  };
  labels_tags?: string[];
  image_url?: string;
  image_front_url?: string;
  image_ingredients_url?: string;
  expiration_date?: string;
}

export interface ProcessedProduct {
  barcode: string;
  product_name?: string;
  brand?: string;
  categories?: string[];
  nutritional_values?: NutritionalValues;
  labels?: string[];
  image_url?: string;
  expiration_date?: string;
}

export interface FoodIntakeRequest {
  barcode: string;
  product_name?: string;
  brand?: string;
  categories?: string[];
  nutritional_values?: NutritionalValues;
  labels?: string[];
  image_url?: string;
  expiration_date?: string;
}
