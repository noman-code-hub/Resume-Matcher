import { apiPost, apiFetch } from './client';
import {
    CareerPathRequest,
    CareerPathResponse,
    CareerAdvisorRequest,
    CareerAdvisorResponse
} from '../types/career';

/**
 * Generate career recommendations.
 */
export async function recommendCareerSteps(request: CareerAdvisorRequest): Promise<CareerAdvisorResponse> {
    const response = await apiPost('/career/recommend', request);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate career recommendations');
    }
    return response.json();
}

/**
 * List career recommendations for a user.
 */
export async function fetchCareerRecommendations(uid?: string): Promise<CareerAdvisorResponse[]> {
    const endpoint = uid ? `/career/recommend/list?uid=${uid}` : '/career/recommend/list';
    const response = await apiFetch(endpoint);
    if (!response.ok) {
        throw new Error('Failed to fetch career recommendations');
    }
    return response.json();
}

/**
 * Generate a new career path.
 */
export async function generateCareerPath(request: CareerPathRequest): Promise<CareerPathResponse> {
    const response = await apiPost('/career/generate', request);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate career path');
    }
    return response.json();
}

/**
 * List career paths for a user.
 */
export async function fetchCareerPaths(uid?: string): Promise<CareerPathResponse[]> {
    const endpoint = uid ? `/career/list?uid=${uid}` : '/career/list';
    const response = await apiFetch(endpoint);
    if (!response.ok) {
        throw new Error('Failed to fetch career paths');
    }
    return response.json();
}

/**
 * Get a specific career path.
 */
export async function fetchCareerPath(id: string): Promise<CareerPathResponse> {
    const response = await apiFetch(`/career/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch career path');
    }
    return response.json();
}
