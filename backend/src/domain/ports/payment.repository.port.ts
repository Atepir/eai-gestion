import { Payment } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentRepositoryPort {
    findById(id: string): Promise<Payment | null>;
    findByInvoiceId(invoiceId: string): Promise<Payment[]>;
    create(payment: Payment): Promise<Payment>;
}
