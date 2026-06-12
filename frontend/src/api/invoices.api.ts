import apiClient from './client';

export async function getInvoices() {
    const { data } = await apiClient.get('/invoices');
    return data;
}

export async function generateInvoices() {
    const { data } = await apiClient.post('/invoices/generate');
    return data;
}
