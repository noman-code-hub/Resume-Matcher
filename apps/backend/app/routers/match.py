"""Resume match endpoints."""

import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional

from app.schemas.models import MatchResponse
from app.services.parser import parse_document, parse_resume_to_json
from app.services.improver import extract_job_keywords
from app.services.refiner import calculate_keyword_match, analyze_keyword_gaps

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Match"])

@router.post("/match", response_model=MatchResponse)
async def match_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
) -> MatchResponse:
    """Analyze a resume and return a match score and details."""
    try:
        # Read resume content
        content = await resume.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty resume file")
        
        # Parse document to markdown
        markdown_content = await parse_document(content, resume.filename or "resume.pdf")
        
        # Parse to structured JSON
        processed_data = await parse_resume_to_json(markdown_content)
        
        # Default job description if none provided
        jd_text = job_description or "General job description requirements"
        
        # Extract keywords from JD
        jd_keywords = await extract_job_keywords(jd_text)
        
        # Calculate match
        logger.warning(f"DEBUG: JD keywords: {jd_keywords.get('keywords', [])}")
        score = calculate_keyword_match(processed_data, jd_keywords)
        logger.warning(f"DEBUG: Calculated score: {score}")
        
        # Analyze gaps
        # We need all keywords from JD to determine which ones matched
        all_jd_keywords = set()
        all_jd_keywords.update(jd_keywords.get("required_skills", []))
        all_jd_keywords.update(jd_keywords.get("preferred_skills", []))
        all_jd_keywords.update(jd_keywords.get("keywords", []))
        
        gap_analysis = analyze_keyword_gaps(jd_keywords, processed_data, processed_data)
        
        matched_keywords = [kw for kw in all_jd_keywords if kw not in gap_analysis.missing_keywords]
        
        return MatchResponse(
            score=round(score, 2),
            keywords_matched=matched_keywords,
            missing_skills=gap_analysis.missing_keywords,
            summary=f"Your resume matches {round(score, 2)}% of the job requirements."
        )
    except Exception as e:
        logger.error(f"Match analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
