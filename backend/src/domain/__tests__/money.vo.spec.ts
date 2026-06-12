import { Money } from '../value-objects/money.vo';

describe('Money', () => {
    describe('fromDecimal', () => {
        it('should create a Money with rounded amount', () => {
            const m = Money.fromDecimal(150.50);
            expect(m.amount).toBe(150.5);
            expect(m.currency).toBe('XOF');
        });

        it('should round to 2 decimal places', () => {
            const m = Money.fromDecimal(150.555);
            expect(m.amount).toBe(150.56);
        });

        it('should accept custom currency', () => {
            const m = Money.fromDecimal(100, 'EUR');
            expect(m.currency).toBe('EUR');
        });
    });

    describe('zero', () => {
        it('should create zero amount', () => {
            const m = Money.zero();
            expect(m.amount).toBe(0);
            expect(m.currency).toBe('XOF');
        });
    });

    describe('multiply', () => {
        it('should multiply amount by factor', () => {
            const m = Money.fromDecimal(150).multiply(3);
            expect(m.amount).toBe(450);
        });

        it('should handle decimal multiplication', () => {
            const m = Money.fromDecimal(150.33).multiply(3);
            expect(m.amount).toBe(450.99);
        });

        it('should not mutate original', () => {
            const m = Money.fromDecimal(100);
            m.multiply(5);
            expect(m.amount).toBe(100);
        });
    });

    describe('equals', () => {
        it('should return true for equal amounts and currencies', () => {
            const a = Money.fromDecimal(100);
            const b = Money.fromDecimal(100);
            expect(a.equals(b)).toBe(true);
        });

        it('should return false for different amounts', () => {
            const a = Money.fromDecimal(100);
            const b = Money.fromDecimal(200);
            expect(a.equals(b)).toBe(false);
        });

        it('should return false for different currencies', () => {
            const a = Money.fromDecimal(100, 'XOF');
            const b = Money.fromDecimal(100, 'EUR');
            expect(a.equals(b)).toBe(false);
        });
    });

    describe('toString', () => {
        it('should format amount with currency', () => {
            const m = Money.fromDecimal(150000);
            expect(m.toString()).toBe('150 000 XOF');
        });
    });

    describe('validation', () => {
        it('should throw for negative amount', () => {
            expect(() => Money.fromDecimal(-10)).toThrow('Le montant ne peut pas être négatif');
        });
    });
});
