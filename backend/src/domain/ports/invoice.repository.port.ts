import { Invoice } from '../entities/invoice.entity';

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

export interface InvoiceRepositoryPort {
    findById(id: string): Promise<Invoice | null>;
    findAll(): Promise<Invoice[]>;
    findByContractId(contractId: string): Promise<Invoice[]>;
    findByOwnerId(ownerId: string): Promise<Invoice[]>;
    findUnpaidByContractAndPeriod(contractId: string, periodLabel: string): Promise<Invoice | null>;
    findUnpaidPastDue(now: Date): Promise<Invoice[]>;
    create(invoice: Invoice): Promise<Invoice>;
    update(invoice: Invoice): Promise<Invoice>;
}
