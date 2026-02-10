from typing import Any
from pydantic import BaseModel, Field


class CareerPathRequest(BaseModel):
    """Request to generate a career path."""
    uid: str | None = None
    goal: str
    skills: list[str] = Field(default_factory=list)
    experience: str
    education: str


class CareerPathStep(BaseModel):
    """A single step in the career path."""
    title: str
    description: str


class CareerPathResult(BaseModel):
    """The generated career path data."""
    steps: list[str] | list[CareerPathStep]
    recommendedSkills: list[str]
    summary: str
    estimated_timeline: str | None = None


class CareerPathResponse(BaseModel):
    """Response for career path generation."""
    career_path_id: str
    goal: str
    result: CareerPathResult
    created_at: str


class CareerAdvisorRequest(BaseModel):
    """Request for career advice based on current role."""
    uid: str | None = None
    currentRole: str
    skills: list[str] = Field(default_factory=list)
    experience: str
    education: str


class CareerAdvisorResult(BaseModel):
    """The generated career advice data."""
    nextRoles: list[str]
    skillsToLearn: list[str]
    timeline: str
    summary: str


class CareerAdvisorResponse(BaseModel):
    """Response for career advisor recommendations."""
    recommendation_id: str
    currentRole: str
    aiRecommendations: CareerAdvisorResult
    created_at: str
