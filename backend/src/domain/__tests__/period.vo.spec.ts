import { Period } from '../value-objects/period.vo';

describe('Period', () => {
    describe('fromDate', () => {
        it('should compute Q1 (Janvier–Mars) correctly', () => {
            const period = Period.fromDate(new Date(2026, 0, 15));
            expect(period.label).toBe('Janvier–Mars 2026');
            expect(period.startDate).toEqual(new Date(2026, 0, 1));
            expect(period.endDate).toEqual(new Date(2026, 2, 31));
        });

        it('should compute Q2 (Avril–Juin) correctly', () => {
            const period = Period.fromDate(new Date(2026, 4, 10));
            expect(period.label).toBe('Avril–Juin 2026');
            expect(period.startDate).toEqual(new Date(2026, 3, 1));
            expect(period.endDate).toEqual(new Date(2026, 5, 30));
        });

        it('should compute Q3 (Juillet–Septembre) correctly', () => {
            const period = Period.fromDate(new Date(2026, 6, 1));
            expect(period.label).toBe('Juillet–Septembre 2026');
        });

        it('should compute Q4 (Octobre–Décembre) correctly', () => {
            const period = Period.fromDate(new Date(2026, 10, 1));
            expect(period.label).toBe('Octobre–Décembre 2026');
        });
    });

    describe('computeDueDate', () => {
        it('should return startDate + 15 days', () => {
            const period = Period.fromDate(new Date(2026, 0, 15));
            expect(period.computeDueDate()).toEqual(new Date(2026, 0, 16));
        });
    });

    describe('reconstitute', () => {
        it('should reconstruct from props', () => {
            const p = Period.reconstitute({
                label: 'Test',
                startDate: new Date(2026, 0, 1),
                endDate: new Date(2026, 2, 31),
            });
            expect(p.label).toBe('Test');
        });
    });
});
