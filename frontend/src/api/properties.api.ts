import apiClient from './client';

export interface PropertyDto {
    id: string;
    ownerId: string;
    designation: string;
    address: { street: string; city: string; zip: string };
    type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND';
    status: 'OCCUPIED' | 'VACANT';
    createdAt: string;
}

export async function getProperties(): Promise<PropertyDto[]> {
    const { data } = await apiClient.get('/properties');
    return data;
}

export async function getProperty(id: string): Promise<PropertyDto> {
    const { data } = await apiClient.get(`/properties/${id}`);
    return data;
}

export async function createProperty(input: {
    designation: string;
    street: string;
    city: string;
    zip: string;
    type: string;
}): Promise<PropertyDto> {
    const { data } = await apiClient.post('/properties', input);
    return data;
}

export async function updateProperty(id: string, input: Record<string, unknown>): Promise<PropertyDto> {
    const { data } = await apiClient.put(`/properties/${id}`, input);
    return data;
}

export async function deleteProperty(id: string): Promise<void> {
    await apiClient.delete(`/properties/${id}`);
}
