-- PostgreSQL schema for Food Bank Barcode Scanner API
-- This schema is designed for Vercel PostgreSQL

CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category JSONB,
  calories INTEGER,
  protein DECIMAL(10,2),
  fat DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fiber DECIMAL(10,2),
  sugars DECIMAL(10,2),
  sodium DECIMAL(10,2),
  allergens JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  expiry_date DATE,
  quantity INTEGER DEFAULT 1,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_brand ON foods(brand);
CREATE INDEX IF NOT EXISTS idx_foods_created_at ON foods(created_at);

-- Create a function to search across multiple fields
CREATE OR REPLACE FUNCTION search_foods(search_term TEXT)
RETURNS TABLE (
  id UUID,
  barcode VARCHAR(50),
  name VARCHAR(255),
  brand VARCHAR(255),
  category JSONB,
  calories INTEGER,
  protein DECIMAL(10,2),
  fat DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fiber DECIMAL(10,2),
  sugars DECIMAL(10,2),
  sodium DECIMAL(10,2),
  allergens JSONB,
  image_url TEXT,
  expiry_date DATE,
  quantity INTEGER,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.*
  FROM foods f
  WHERE 
    f.name ILIKE '%' || search_term || '%'
    OR f.brand ILIKE '%' || search_term || '%'
    OR f.category::text ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO foods (barcode, name, brand, category, calories, protein, fat, carbs, fiber, sugars, sodium, allergens, image_url, quantity, location) VALUES
('123456789', 'Organic Apple', 'Fresh Farm', '["Fruits", "Organic"]'::jsonb, 52, 0.3, 0.2, 14.0, 2.4, 10.4, 0.001, '["vegan", "gluten-free"]'::jsonb, 'https://example.com/apple.jpg', 5, 'Fridge A'),
('987654321', 'Whole Wheat Bread', 'Bakery Co', '["Bread", "Whole Grain"]'::jsonb, 247, 13.0, 4.2, 41.0, 6.0, 5.0, 0.681, '["gluten-free"]'::jsonb, 'https://example.com/bread.jpg', 3, 'Pantry B')
ON CONFLICT DO NOTHING;