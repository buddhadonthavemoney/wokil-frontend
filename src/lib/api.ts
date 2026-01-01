import axios from 'axios';
import { LawyerProfile } from '@/types/lawyer';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optional: Redirect to login page or handle logout
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export enum ApiEndpoints {
    GOOGLE_LOGIN = '/oauth/google/login',
    GOOGLE_CALLBACK = '/oauth/google/callback',
    PROFILE = '/profile',
    SITES_DEPLOY = '/sites/deploy',
}

export const site = {
    deploy: async (data: { html: string; slug: string }) => {
        const response = await api.post<{ url: string }>(ApiEndpoints.SITES_DEPLOY, data);
        return response.data;
    },
};

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
};

export default api;
