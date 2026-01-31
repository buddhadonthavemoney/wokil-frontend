import axios from 'axios';
import { LawyerProfile } from '@/types/lawyer';
import { Site, CreateSiteRequest, VerificationResponse } from '@/types/site';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            // window.location.href = '/login'; // optional
        }
        return Promise.reject(error);
    }
);

export enum ApiEndpoints {
    GOOGLE_LOGIN = '/oauth/google/login',
    GOOGLE_CALLBACK = '/oauth/google/callback',
    PROFILE = '/profile',
    SITES_DEPLOY = '/sites/deploy',
    SITES_PREVIEW = '/sites/preview',
    SITES_CHECK = '/sites/check',
    SITES_ANALYTICS = '/sites/analytics',
    SITES_GA = '/sites/ga',
    SITES_LIST = '/sites',
    PROFILE_VISIBILITY = '/profile/visibility',
    PUBLIC_PEOPLE = '/public/people',
    THEMES = '/themes',
}

export const site = {
    deploy: async (data: { slug: string }) => {
        const response = await api.post<{ url: string }>(ApiEndpoints.SITES_DEPLOY, data);
        return response.data;
    },
    getPreview: async () => {
        const response = await api.get<string>(ApiEndpoints.SITES_PREVIEW, {
            headers: { 'Accept': 'text/html' }
        });
        return response.data;
    },
    checkSlug: async (slug: string) => {
        const response = await api.post<{ available: boolean }>(ApiEndpoints.SITES_CHECK, {
            subdomain: slug
        });
        return response.data;
    },
    getAnalytics: async () => {
        const response = await api.get<AnalyticsData>(ApiEndpoints.SITES_ANALYTICS);
        return response.data;
    },
    enableAnalytics: async () => {
        const response = await api.post(ApiEndpoints.SITES_GA);
        return response.data;
    },
    list: async () => {
        const response = await api.get<Site[]>(ApiEndpoints.SITES_LIST);
        return response.data;
    },
    create: async (data: CreateSiteRequest) => {
        const response = await api.post<Site>(ApiEndpoints.SITES_LIST, data);
        return response.data;
    },
    delete: async (domain: string) => {
        await api.delete(`${ApiEndpoints.SITES_LIST}/${domain}`);
    },
    getVerificationRecords: async (domain: string) => {
        const response = await api.get<VerificationResponse>(`${ApiEndpoints.SITES_LIST}/${domain}/verification`);
        return response.data;
    },
    verify: async (domain: string) => {
        const response = await api.post(`${ApiEndpoints.SITES_LIST}/${domain}/verify`);
        return response.data;
    },
    getThemes: async () => {
        const response = await api.get<string[]>(ApiEndpoints.THEMES);
        return response.data;
    }
};

export interface AnalyticsData {
    history: { date: string; views: number }[];
    sources: Record<string, number>;
    totalViews: number;
    visitors: number;
}

export const auth = {
    getLoginUrl: async () => {
        const response = await api.get<{ url: string }>(ApiEndpoints.GOOGLE_LOGIN);
        return response.data.url;
    },
    handleCallback: async (code: string) => {
        const response = await api.get<{ token: string }>(`${ApiEndpoints.GOOGLE_CALLBACK}?code=${code}`);
        return response.data;
    },
};

export const profile = {
    get: async () => {
        const response = await api.get<LawyerProfile>(ApiEndpoints.PROFILE);
        return response.data;
    },
    save: async (data: LawyerProfile) => {
        const response = await api.put<LawyerProfile>(ApiEndpoints.PROFILE, data);
        return response.data;
    },
    getPublic: async (slug: string) => {
        const response = await api.get<LawyerProfile>(`/public/profile/${slug}`);
        return response.data;
    },
    updateVisibility: async (data: Record<string, boolean>) => {
        const response = await api.put<string>(ApiEndpoints.PROFILE_VISIBILITY, data);
        return response.data;
    },
};

export interface PublicProfileRow {
    name: string;
    professionalTitle: string;
    picture?: string;
    domains: string[];
}

export interface PublicPeopleResponse {
    profiles: PublicProfileRow[];
    meta: {
        total: number;
        hidden: number;
    };
}

export const publicPeople = {
    list: async () => {
        const response = await api.get<PublicPeopleResponse>(ApiEndpoints.PUBLIC_PEOPLE);
        return response.data;
    },
};

export default api;
