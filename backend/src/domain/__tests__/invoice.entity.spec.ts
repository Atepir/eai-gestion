import { Invoice } from '../entities/invoice.entity';
import { Money } from '../value-objects/money.vo';

describe('Invoice', () => {
    const createInvoice = (overrides?: Partial<{ status: 'UNPAID' | 'PAID'; dueDate: Date }>) =>
        Invoice.create({
            id: 'inv-1',
            contractId: 'ctr-1',
            ownerId: 'own-1',
            periodLabel: 'Janvier–Mars 2026',
            amount: Money.fromDecimal(450000),
            dueDate: overrides?.dueDate ?? new Date('2026-01-15'),
        });

    describe('create', () => {
        it('should create with UNPAID status', () => {
            const inv = createInvoice();
            expect(inv.status).toBe('UNPAID');
            expect(inv.amount.amount).toBe(450000);
            expect(inv.periodLabel).toBe('Janvier–Mars 2026');
        });
    });

    describe('isPaid', () => {
        it('should return false for UNPAID', () => {
            expect(createInvoice().isPaid()).toBe(false);
        });

        it('should return true for PAID (after markAsPaid)', () => {
            const inv = createInvoice().markAsPaid();
            expect(inv.isPaid()).toBe(true);
        });
    });

    describe('markAsPaid', () => {
        it('should change status to PAID', () => {
            const inv = createInvoice().markAsPaid();
            expect(inv.status).toBe('PAID');
        });

        it('should throw if already paid', () => {
            const inv = createInvoice().markAsPaid();
            expect(() => inv.markAsPaid()).toThrow('Facture déjà payée');
        });

        it('should not mutate original', () => {
            const inv = createInvoice();
            inv.markAsPaid();
            expect(inv.status).toBe('UNPAID');
        });
    });

    describe('isOverdue', () => {
        it('should return true if UNPAID and past due', () => {
            const inv = createInvoice({ dueDate: new Date('2020-01-01') });
            expect(inv.isOverdue(new Date('2026-06-12'))).toBe(true);
        });

        it('should return false if UNPAID but not yet due', () => {
            const inv = createInvoice({ dueDate: new Date('2030-01-01') });
            expect(inv.isOverdue(new Date('2026-06-12'))).toBe(false);
        });

        it('should return false if PAID even if past due', () => {
            const inv = createInvoice({ dueDate: new Date('2020-01-01') }).markAsPaid();
            expect(inv.isOverdue(new Date('2026-06-12'))).toBe(false);
        });
    });
});
