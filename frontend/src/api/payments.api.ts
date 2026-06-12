import apiClient from './client';

export async function recordPayment(input: {
    invoiceId: string;
    amount: number;
    method: string;
    paymentDate: string;
    reference?: string;
    notes?: string;
}) {
    const { data } = await apiClient.post('/payments', input);
    return data;
}

export async function getPayments() {
    const { data } = await apiClient.get('/payments');
    return data;
}
