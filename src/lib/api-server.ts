import axios from 'axios';
import { PublicPeopleResponse } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Server-side API client (no interceptors for localStorage)
const serverApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const publicPeopleServer = {
    list: async (): Promise<PublicPeopleResponse> => {
        const response = await serverApi.get<PublicPeopleResponse>('/public/people');
        return response.data;
    },
};
