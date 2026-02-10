from fastapi import APIRouter, HTTPException
from app.database import db
from app.schemas.career import (
    CareerPathRequest, 
    CareerPathResponse, 
    CareerPathResult,
    CareerAdvisorRequest,
    CareerAdvisorResponse,
    CareerAdvisorResult
)
from app.services.career_path import generate_career_path_result
from app.services.career_advisor import generate_career_advice_result
import logging

router = APIRouter(tags=["career"])

logger = logging.getLogger(__name__)

@router.post("/career/generate", response_model=CareerPathResponse)
async def generate_career_path(request: CareerPathRequest):
    """Generate and store a career path."""
    try:
        result = await generate_career_path_result(request)
        
        # Store in database
        doc = db.create_career_path(
            uid=request.uid,
            goal=request.goal,
            skills=request.skills,
            experience=request.experience,
            education=request.education,
            result=result.model_dump()
        )
        
        return CareerPathResponse(
            career_path_id=doc["career_path_id"],
            goal=doc["goal"],
            result=result,
            created_at=doc["created_at"]
        )
    except Exception as e:
        logger.error(f"Error in generate_career_path: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/career/recommend", response_model=CareerAdvisorResponse)
async def recommend_career_steps(request: CareerAdvisorRequest):
    """Generate and store career recommendations."""
    try:
        result = await generate_career_advice_result(request)
        
        # Store in database
        doc = db.create_career_recommendation(
            uid=request.uid,
            currentRole=request.currentRole,
            skills=request.skills,
            experience=request.experience,
            education=request.education,
            aiRecommendations=result.model_dump()
        )
        
        return CareerAdvisorResponse(
            recommendation_id=doc["recommendation_id"],
            currentRole=doc["currentRole"],
            aiRecommendations=result,
            created_at=doc["created_at"]
        )
    except Exception as e:
        logger.error(f"Error in recommend_career_steps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/career/recommend/list", response_model=list[CareerAdvisorResponse])
async def list_career_recommendations(uid: str | None = None):
    """List career recommendations for a user."""
    docs = db.list_career_recommendations(uid=uid)
    return [
        CareerAdvisorResponse(
            recommendation_id=doc["recommendation_id"],
            currentRole=doc["currentRole"],
            aiRecommendations=CareerAdvisorResult(**doc["aiRecommendations"]),
            created_at=doc["created_at"]
        )
        for doc in docs
    ]

@router.get("/career/list", response_model=list[CareerPathResponse])
async def list_career_paths(uid: str | None = None):
    """List career paths for a user."""
    docs = db.list_career_paths(uid=uid)
    return [
        CareerPathResponse(
            career_path_id=doc["career_path_id"],
            goal=doc["goal"],
            result=CareerPathResult(**doc["result"]),
            created_at=doc["created_at"]
        )
        for doc in docs
    ]

@router.get("/career/{career_path_id}", response_model=CareerPathResponse)
async def get_career_path(career_path_id: str):
    """Get a specific career path."""
    doc = db.get_career_path(career_path_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Career path not found")
    
    return CareerPathResponse(
        career_path_id=doc["career_path_id"],
        goal=doc["goal"],
        result=CareerPathResult(**doc["result"]),
        created_at=doc["created_at"]
    )
