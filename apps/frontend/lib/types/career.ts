export interface CareerPathStep {
    title: string;
    description: string;
}

export interface CareerPathResult {
    steps: string[] | CareerPathStep[];
    recommendedSkills: string[];
    summary: string;
    estimated_timeline?: string;
}

export interface CareerPathRequest {
    uid?: string;
    goal: string;
    skills: string[];
    experience: string;
    education: string;
}

export interface CareerPathResponse {
    career_path_id: string;
    goal: string;
    result: CareerPathResult;
    created_at: string;
}

export interface CareerAdvisorRequest {
    uid?: string;
    currentRole: string;
    skills: string[];
    experience: string;
    education: string;
}

export interface CareerAdvisorResult {
    nextRoles: string[];
    skillsToLearn: string[];
    timeline: string;
    summary: string;
}

export interface CareerAdvisorResponse {
    recommendation_id: string;
    currentRole: string;
    aiRecommendations: CareerAdvisorResult;
    created_at: string;
}
