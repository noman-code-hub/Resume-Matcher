import logging
from typing import Any

from app.llm import complete_json
from app.schemas.career import CareerPathRequest, CareerPathResult

logger = logging.getLogger(__name__)

CAREER_PATH_PROMPT = """
You are an AI career mentor. Based on the user's career goal and their current profile, generate a personalized career path.

Career Goal: {goal}
Current Skills: {skills}
Experience: {experience}
Education: {education}

Your response must be a JSON object with the following structure:
{{
  "steps": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "recommendedSkills": ["Skill 1", "Skill 2", ...],
  "summary": "A short motivational summary including next focus areas.",
  "estimated_timeline": "e.g., 6-12 months"
}}

Ensure the steps are actionable and progressive. Focus on bridging the gap between current skills and the target career goal.
"""

async def generate_career_path_result(request: CareerPathRequest) -> CareerPathResult:
    """Generate a career path using LLM."""
    
    prompt = CAREER_PATH_PROMPT.format(
        goal=request.goal,
        skills=", ".join(request.skills),
        experience=request.experience,
        education=request.education
    )

    try:
        result_dict = await complete_json(prompt)
        return CareerPathResult(**result_dict)
    except Exception as e:
        logger.error(f"Failed to generate career path: {e}")
        raise ValueError("Failed to generate career path roadmap. Please try again.")
