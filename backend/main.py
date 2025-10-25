"""
FastAPI application for the food tracking system.
Provides REST API endpoints for managing food inventory and nutrition logs.
"""

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from contextlib import asynccontextmanager
import logging
import pandas as pd
from datetime import datetime

from database import get_db, create_tables, test_connection
from crud import (
    create_food, get_food_by_barcode, get_food_by_id, get_all_foods,
    search_foods, update_food, update_quantity, delete_food, delete_food_by_barcode,
    log_nutrition_event, get_nutrition_logs, bulk_import_from_dataframe,
    get_foods_by_category, get_expiring_foods, get_low_stock_foods
)
from schemas import (
    FoodCreate, FoodUpdate, FoodResponse, NutritionLogCreate, NutritionLogResponse,
    FoodSearchRequest, QuantityUpdateRequest, BulkImportRequest, BulkImportResponse,
    FoodInventoryResponse, ExpiringFoodsRequest, LowStockRequest, ErrorResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    try:
        create_tables()
        if test_connection():
            logger.info("Database connection successful")
        else:
            logger.error("Database connection failed")
    except Exception as e:
        logger.error(f"Startup error: {e}")
    yield
    # Cleanup code can go here if needed

# Create FastAPI app
app = FastAPI(
    title="Food Tracking API",
    description="API for managing food inventory and nutrition tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now()}


# Food endpoints
@app.post("/foods/", response_model=FoodResponse, status_code=status.HTTP_201_CREATED)
async def create_food_endpoint(food: FoodCreate, db: Session = Depends(get_db)):
    """Create a new food item (allows duplicates)."""
    try:
        # Always create new food item (no duplicate checking)
        food_data = food.dict()
        created_food = create_food(db, food_data)
        logger.info(f"Created new food: {food.barcode}")
        return created_food
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating food: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@app.get("/foods/{food_id}", response_model=FoodResponse)
async def get_food_endpoint(food_id: str, db: Session = Depends(get_db)):
    """Get a food item by ID."""
    food = get_food_by_id(db, food_id)
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )
    return food


@app.get("/foods/barcode/{barcode}", response_model=FoodResponse)
async def get_food_by_barcode_endpoint(barcode: str, db: Session = Depends(get_db)):
    """Get a food item by barcode."""
    food = get_food_by_barcode(db, barcode)
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )
    return food


@app.get("/foods/", response_model=List[FoodResponse])
async def get_foods_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all food items with pagination."""
    foods = get_all_foods(db, skip=skip, limit=limit)
    return foods


@app.get("/foods/search/", response_model=List[FoodResponse])
async def search_foods_endpoint(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Search food items by name or brand."""
    foods = search_foods(db, q, skip=skip, limit=limit)
    return foods


@app.put("/foods/{food_id}", response_model=FoodResponse)
async def update_food_endpoint(
    food_id: str,
    food_update: FoodUpdate,
    db: Session = Depends(get_db)
):
    """Update a food item."""
    # Filter out None values
    update_data = {k: v for k, v in food_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided"
        )
    
    updated_food = update_food(db, food_id, update_data)
    if not updated_food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )
    return updated_food


@app.put("/foods/{food_id}/quantity", response_model=FoodResponse)
async def update_quantity_endpoint(
    food_id: str,
    quantity_update: QuantityUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update food quantity and log the change."""
    updated_food = update_quantity(
        db, food_id, quantity_update.quantity_change, quantity_update.action
    )
    if not updated_food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )
    return updated_food


@app.delete("/foods/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_endpoint(food_id: str, db: Session = Depends(get_db)):
    """Delete a food item."""
    success = delete_food(db, food_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )


@app.delete("/foods/barcode/{barcode}", status_code=status.HTTP_200_OK)
async def delete_food_by_barcode_endpoint(barcode: str, db: Session = Depends(get_db)):
    """Delete all food items with a specific barcode."""
    success = delete_food_by_barcode(db, barcode)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No food items found with this barcode"
        )
    return {"message": f"All food items with barcode {barcode} have been deleted"}


# Nutrition log endpoints
@app.post("/nutrition-logs/", response_model=NutritionLogResponse, status_code=status.HTTP_201_CREATED)
async def create_nutrition_log_endpoint(
    nutrition_log: NutritionLogCreate,
    db: Session = Depends(get_db)
):
    """Create a new nutrition log entry."""
    # Verify food exists
    food = get_food_by_id(db, str(nutrition_log.food_id))
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )
    
    created_log = log_nutrition_event(
        db, str(nutrition_log.food_id), nutrition_log.quantity, nutrition_log.action
    )
    return created_log


@app.get("/nutrition-logs/", response_model=List[NutritionLogResponse])
async def get_nutrition_logs_endpoint(
    food_id: Optional[str] = Query(None, description="Filter by food ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get nutrition logs, optionally filtered by food ID."""
    logs = get_nutrition_logs(db, food_id, skip=skip, limit=limit)
    return logs


# Bulk operations
@app.post("/foods/bulk-import", response_model=BulkImportResponse)
async def bulk_import_endpoint(
    import_data: BulkImportRequest,
    db: Session = Depends(get_db)
):
    """Import multiple food items from a list."""
    try:
        # Convert to DataFrame
        df = pd.DataFrame(import_data.data)
        results = bulk_import_from_dataframe(df)
        return BulkImportResponse(**results)
    except Exception as e:
        logger.error(f"Bulk import error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk import failed: {str(e)}"
        )


# Inventory management endpoints
@app.get("/inventory/", response_model=List[FoodResponse])
async def get_inventory_endpoint(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get food inventory, optionally filtered by category."""
    if category:
        foods = get_foods_by_category(db, category)
    else:
        foods = get_all_foods(db)
    return foods


@app.get("/inventory/expiring", response_model=List[FoodResponse])
async def get_expiring_foods_endpoint(
    days_ahead: int = Query(7, ge=1, le=365, description="Days ahead to check"),
    db: Session = Depends(get_db)
):
    """Get foods that are expiring within the specified number of days."""
    foods = get_expiring_foods(db, days_ahead)
    return foods


@app.get("/inventory/low-stock", response_model=List[FoodResponse])
async def get_low_stock_foods_endpoint(
    threshold: int = Query(5, ge=0, description="Quantity threshold"),
    db: Session = Depends(get_db)
):
    """Get foods with low stock (quantity below threshold)."""
    foods = get_low_stock_foods(db, threshold)
    return foods


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    return ErrorResponse(
        detail=exc.detail,
        error_code=str(exc.status_code),
        timestamp=datetime.now()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return ErrorResponse(
        detail="Internal server error",
        error_code="500",
        timestamp=datetime.now()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
