import { Termination } from '../entities/termination.entity';
import { TerminationChecklist } from '../value-objects/checklist-item.vo';

describe('Termination', () => {
    const createTermination = () =>
        Termination.create({
            id: 'term-1',
            contractId: 'ctr-1',
            noticeDate: new Date('2026-06-12'),
            endDate: new Date('2026-09-12'),
            depositAmount: 150000,
        });

    describe('create', () => {
        it('should create with IN_PROGRESS status', () => {
            const t = createTermination();
            expect(t.status).toBe('IN_PROGRESS');
        });

        it('should create with default 5-item checklist', () => {
            const t = createTermination();
            expect(t.checklist.items).toHaveLength(5);
            expect(t.checklist.items[0].label).toBe("État des lieux d'entrée");
        });

        it('should store deposit amount', () => {
            const t = createTermination();
            expect(t.depositAmount?.amount).toBe(150000);
        });
    });

    describe('remainingDays', () => {
        it('should compute remaining days correctly', () => {
            const t = createTermination();
            // endDate is 2026-09-12, now is 2026-06-12 → 92 days
            expect(t.remainingDays(new Date('2026-06-12'))).toBe(92);
        });

        it('should return 0 if endDate has passed', () => {
            const t = createTermination();
            expect(t.remainingDays(new Date('2026-10-01'))).toBeLessThan(0);
        });
    });

    describe('canClose', () => {
        it('should return false when checklist is not complete', () => {
            const t = createTermination();
            expect(t.canClose()).toBe(false);
        });

        it('should return false when checklist complete but deposit not refunded', () => {
            const t = createTermination();
            const completeItems = t.checklist.items.map((i) => ({ ...i, completed: true }));
            const updated = t.updateChecklist(TerminationChecklist.reconstitute(completeItems));
            expect(updated.canClose()).toBe(false);
        });

        it('should return true when checklist complete and deposit refunded', () => {
            const t = createTermination();
            const completeItems = t.checklist.items.map((i) => ({ ...i, completed: true }));
            const withChecklist = t.updateChecklist(TerminationChecklist.reconstitute(completeItems));
            const withDeposit = withChecklist.markDepositRefunded();
            expect(withDeposit.canClose()).toBe(true);
        });
    });

    describe('close', () => {
        it('should change status to COMPLETED', () => {
            const t = createTermination();
            const completeItems = t.checklist.items.map((i) => ({ ...i, completed: true }));
            const ready = t.updateChecklist(TerminationChecklist.reconstitute(completeItems)).markDepositRefunded();
            const closed = ready.close();
            expect(closed.status).toBe('COMPLETED');
        });

        it('should throw if not ready to close', () => {
            const t = createTermination();
            expect(() => t.close()).toThrow('Checklist incomplète ou caution non traitée');
        });
    });

    describe('markDepositRefunded', () => {
        it('should set depositRefunded to true', () => {
            const t = createTermination().markDepositRefunded();
            expect(t.depositRefunded).toBe(true);
        });
    });
});
