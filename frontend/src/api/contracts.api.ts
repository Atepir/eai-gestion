import apiClient from './client';

export async function createContract(input: {
    propertyId: string;
    tenantId: string;
    monthlyRent: number;
    startDate: string;
    endDate: string;
}) {
    const { data } = await apiClient.post('/contracts', input);
    return data;
}
