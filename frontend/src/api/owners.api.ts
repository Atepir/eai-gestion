import apiClient from './client';

export interface OwnerDto {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    createdAt: string;
}

export async function getOwners(): Promise<OwnerDto[]> {
    const { data } = await apiClient.get('/owners');
    return data;
}

export async function getOwner(id: string): Promise<OwnerDto> {
    const { data } = await apiClient.get(`/owners/${id}`);
    return data;
}

export async function createOwner(input: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}): Promise<OwnerDto> {
    const { data } = await apiClient.post('/owners', input);
    return data;
}

export async function updateOwner(id: string, input: Record<string, unknown>): Promise<OwnerDto> {
    const { data } = await apiClient.put(`/owners/${id}`, input);
    return data;
}

export async function deleteOwner(id: string): Promise<void> {
    await apiClient.delete(`/owners/${id}`);
}
