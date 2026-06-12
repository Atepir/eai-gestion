import apiClient from './client';

export interface TenantDto {
    id: string;
    ownerId: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
    profession: string | null;
    idDocumentType: string;
    idDocumentNumber: string;
    createdAt: string;
}

export async function getTenants(): Promise<TenantDto[]> {
    const { data } = await apiClient.get('/tenants');
    return data;
}

export async function getTenant(id: string): Promise<TenantDto> {
    const { data } = await apiClient.get(`/tenants/${id}`);
    return data;
}

export async function createTenant(input: {
    firstName: string;
    lastName: string;
    idDocumentType: string;
    idDocumentNumber: string;
    phone?: string;
    email?: string;
    profession?: string;
}): Promise<TenantDto> {
    const { data } = await apiClient.post('/tenants', input);
    return data;
}

export async function updateTenant(id: string, input: Record<string, unknown>): Promise<TenantDto> {
    const { data } = await apiClient.put(`/tenants/${id}`, input);
    return data;
}
