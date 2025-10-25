#!/usr/bin/env python3
"""
Example script showing how to import pandas data into the food tracking database.
"""

import pandas as pd
import requests
import json
from typing import List, Dict, Any
from datetime import datetime

def prepare_food_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Prepare pandas DataFrame for bulk import.
    
    Expected columns:
    - barcode: str (required)
    - name: str (required) 
    - brand: str (optional)
    - category: str (optional)
    - calories: int (optional)
    - protein: float (optional)
    - fat: float (optional)
    - carbs: float (optional)
    - fiber: float (optional)
    - sugars: float (optional)
    - sodium: float (optional)
    - allergens: list (optional)
    - expiry_date: str (optional, YYYY-MM-DD format)
    - quantity: int (optional, default 1)
    - location: str (optional)
    """
    
    # Convert DataFrame to list of dictionaries
    data = df.to_dict('records')
    
    # Clean up the data
    for item in data:
        # Handle NaN values
        for key, value in item.items():
            if pd.isna(value):
                item[key] = None
        
        # Ensure required fields
        if 'barcode' not in item or not item['barcode']:
            raise ValueError("barcode is required for all items")
        if 'name' not in item or not item['name']:
            raise ValueError("name is required for all items")
            
        # Set default quantity if not provided
        if 'quantity' not in item or item['quantity'] is None:
            item['quantity'] = 1
            
        # Convert allergens to list if it's a string
        if 'allergens' in item and isinstance(item['allergens'], str):
            item['allergens'] = [item['allergens']] if item['allergens'] else []
        
        # Keep expiry_date as string for JSON serialization
        # The backend will handle the date conversion
        if 'expiry_date' in item and item['expiry_date']:
            # Ensure it's a string in YYYY-MM-DD format
            if isinstance(item['expiry_date'], str):
                try:
                    # Validate the date format
                    datetime.strptime(item['expiry_date'], '%Y-%m-%d')
                except ValueError:
                    item['expiry_date'] = None
            else:
                item['expiry_date'] = None
    
    return data

def import_food_data(data: List[Dict[str, Any]], api_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Import food data to the database via API.
    
    Args:
        data: List of food dictionaries
        api_url: Base URL of the API
        
    Returns:
        Response from the API
    """
    url = f"{api_url}/foods/bulk-import"
    
    payload = {
        "data": data
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()

# Example usage
if __name__ == "__main__":
    # Example DataFrame
    sample_data = {
        'barcode': ['123456789', '987654321', '555666777'],
        'name': ['Apple', 'Banana', 'Orange'],
        'brand': ['Fresh Farm', 'Tropical', 'Citrus Co'],
        'category': ['Fruits', 'Fruits', 'Fruits'],
        'calories': [52, 89, 47],
        'protein': [0.3, 1.1, 0.9],
        'fat': [0.2, 0.3, 0.1],
        'carbs': [14, 23, 12],
        'fiber': [2.4, 2.6, 2.4],
        'sugars': [10.4, 12.2, 9.4],
        'sodium': [0.001, 0.001, 0.001],
        'allergens': [[], [], []],
        'expiry_date': ['2024-12-31', '2024-12-25', '2024-12-30'],
        'quantity': [5, 3, 8],
        'location': ['Fridge A', 'Fridge B', 'Fridge A']
    }
    
    # Create DataFrame
    df = pd.DataFrame(sample_data)
    print("Sample DataFrame:")
    print(df)
    print("\n" + "="*50 + "\n")
    
    # Prepare data for import
    try:
        prepared_data = prepare_food_data(df)
        print("Prepared data for import:")
        print(json.dumps(prepared_data, indent=2))
        print("\n" + "="*50 + "\n")
        
        # Import to database
        result = import_food_data(prepared_data)
        print("Import result:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")
