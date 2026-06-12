import { Contract } from '../entities/contract.entity';
import { Money } from '../value-objects/money.vo';

describe('Contract', () => {
    const createContract = () =>
        Contract.create({
            id: 'ctr-1',
            ownerId: 'own-1',
            propertyId: 'prop-1',
            tenantId: 'ten-1',
            monthlyRent: Money.fromDecimal(150000),
            startDate: new Date('2026-01-01'),
            endDate: new Date('2027-01-01'),
        });

    describe('create', () => {
        it('should create with ACTIVE status', () => {
            const c = createContract();
            expect(c.status).toBe('ACTIVE');
            expect(c.monthlyRent.amount).toBe(150000);
        });

        it('should throw if endDate is before startDate', () => {
            expect(() =>
                Contract.create({
                    id: 'ctr-1', ownerId: 'own-1', propertyId: 'prop-1', tenantId: 'ten-1',
                    monthlyRent: Money.fromDecimal(150000),
                    startDate: new Date('2027-01-01'),
                    endDate: new Date('2026-01-01'),
                }),
            ).toThrow('La date de fin doit être après la date de début');
        });
    });

    describe('isActive', () => {
        it('should return true for ACTIVE', () => {
            expect(createContract().isActive()).toBe(true);
        });

        it('should return true for NOTICE', () => {
            const c = createContract().markAsNotice();
            expect(c.isActive()).toBe(true);
        });
    });

    describe('markAsNotice', () => {
        it('should change status to NOTICE', () => {
            const c = createContract().markAsNotice();
            expect(c.status).toBe('NOTICE');
        });

        it('should throw if not active', () => {
            const c = createContract().terminate();
            expect(() => c.markAsNotice()).toThrow('Seul un contrat actif peut passer en préavis');
        });

        it('should not mutate original', () => {
            const c = createContract();
            c.markAsNotice();
            expect(c.status).toBe('ACTIVE');
        });
    });

    describe('terminate', () => {
        it('should change status to TERMINATED', () => {
            const c = createContract().terminate();
            expect(c.status).toBe('TERMINATED');
        });

        it('should throw if already terminated', () => {
            const c = createContract().terminate();
            expect(() => c.terminate()).toThrow('Contrat déjà terminé');
        });
    });

    describe('markExpired', () => {
        it('should change status to EXPIRED', () => {
            const c = createContract().markExpired();
            expect(c.status).toBe('EXPIRED');
        });
    });
});
