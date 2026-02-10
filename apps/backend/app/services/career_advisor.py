import logging
from typing import Any

from app.llm import complete_json
from app.schemas.career import CareerAdvisorRequest, CareerAdvisorResult

logger = logging.getLogger(__name__)

CAREER_ADVISOR_PROMPT = """
You are an expert career mentor AI. Based on the user's current role, skills, and experience, suggest the next steps for their career.

Provide recommendations for:
1. The next 3 possible career roles they can target.
2. The key skills they should learn next.
3. An estimated timeline to grow into those roles.
4. A motivational one-paragraph summary.

User Data:
- Current Role: {currentRole}
- Skills: {skills}
- Experience: {experience}
- Education: {education}

Your response must be a JSON object with the following structure:
{{
  "nextRoles": ["Role 1", "Role 2", "Role 3"],
  "skillsToLearn": ["Skill 1", "Skill 2", ...],
  "timeline": "e.g., 6-8 months to reach mid-level developer",
  "summary": "You're on the right track. Strengthen ... and start building ..."
}}

Be specific and practical in your advice.
"""

async def generate_career_advice_result(request: CareerAdvisorRequest) -> CareerAdvisorResult:
    \"\"\"Generate career advice using LLM.\"\"\"
    
    prompt = CAREER_ADVISOR_PROMPT.format(
        currentRole=request.currentRole,
        skills=", ".join(request.skills),
        experience=request.experience,
        education=request.education
    )

    try:
        result_dict = await complete_json(prompt)
        return CareerAdvisorResult(**result_dict)
    except Exception as e:
        logger.error(f"Failed to generate career advice: {e}")
        raise ValueError("Failed to generate career recommendations. Please try again.")
