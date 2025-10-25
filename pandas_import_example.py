#!/usr/bin/env python3
"""
Complete example of importing pandas data into the food tracking database.
This shows the EXACT format your DataFrame should be in.
"""

import pandas as pd
import requests
import json
from datetime import datetime, date
from typing import List, Dict, Any

def create_sample_dataframe() -> pd.DataFrame:
    """
    Create a properly formatted DataFrame for import.
    This is the EXACT format your data should be in.
    """
    
    # Method 1: Create with date objects directly
    df = pd.DataFrame({
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
        'allergens': [[], [], []],  # List of strings
        'expiry_date': [
            date(2024, 12, 31),  # Python date object
            date(2024, 12, 25),  # Python date object
            date(2024, 12, 30)   # Python date object
        ],
        'quantity': [5, 3, 8],
        'location': ['Fridge A', 'Fridge B', 'Fridge A']
    })
    
    return df

def convert_string_dates_to_objects(df: pd.DataFrame) -> pd.DataFrame:
    """
    If your DataFrame has date strings, convert them to date objects.
    """
    if 'expiry_date' in df.columns:
        # Convert string dates to date objects
        df['expiry_date'] = pd.to_datetime(df['expiry_date']).dt.date
    
    return df

def prepare_dataframe_for_import(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Prepare DataFrame for API import.
    """
    # Convert to list of dictionaries
    data = df.to_dict('records')
    
    # Handle NaN values
    for item in data:
        for key, value in item.items():
            if pd.isna(value):
                item[key] = None
    
    return data

def import_to_database(data: List[Dict[str, Any]], api_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Import data to database via API.
    """
    url = f"{api_url}/foods/bulk-import"
    payload = {"data": data}
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Example usage with different data sources
if __name__ == "__main__":
    print("=== Method 1: Create DataFrame with date objects ===")
    df1 = create_sample_dataframe()
    print("DataFrame with date objects:")
    print(df1.dtypes)
    print("\nSample data:")
    print(df1.head())
    
    print("\n" + "="*60 + "\n")
    
    print("=== Method 2: Convert from string dates ===")
    # If you have string dates in your data
    df_with_strings = pd.DataFrame({
        'barcode': ['111111111', '222222222'],
        'name': ['Grape', 'Strawberry'],
        'expiry_date': ['2024-12-20', '2024-12-15'],  # String dates
        'calories': [67, 32]
    })
    
    print("Before conversion:")
    print(df_with_strings.dtypes)
    
    df_converted = convert_string_dates_to_objects(df_with_strings)
    print("\nAfter conversion:")
    print(df_converted.dtypes)
    
    print("\n" + "="*60 + "\n")
    
    print("=== Method 3: Import to database ===")
    try:
        # Prepare data
        prepared_data = prepare_dataframe_for_import(df1)
        print("Prepared data for import:")
        print(json.dumps(prepared_data[:1], indent=2, default=str))  # Show first item
        
        # Import to database
        result = import_to_database(prepared_data)
        print(f"\nImport result: {result}")
        
    except Exception as e:
        print(f"Import error: {e}")

# Additional helper functions for common scenarios
def load_from_csv_with_dates(csv_file: str) -> pd.DataFrame:
    """
    Load CSV and convert date columns properly.
    """
    df = pd.read_csv(csv_file)
    
    # Convert date columns if they exist
    date_columns = ['expiry_date', 'created_at', 'updated_at']
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col]).dt.date
    
    return df

def load_from_excel_with_dates(excel_file: str, sheet_name: str = None) -> pd.DataFrame:
    """
    Load Excel file and convert date columns properly.
    """
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    
    # Convert date columns if they exist
    date_columns = ['expiry_date', 'created_at', 'updated_at']
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col]).dt.date
    
    return df
