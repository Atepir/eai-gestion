import apiClient from './client';

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        role: 'ADMIN' | 'OWNER';
        ownerId?: string;
    };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
}

export async function getMe(): Promise<AuthResponse['user']> {
    const { data } = await apiClient.get('/auth/me');
    return data;
}
