import { Money } from '../value-objects/money.vo';
import { TerminationChecklist } from '../value-objects/checklist-item.vo';

export type TerminationStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface TerminationProps {
    id: string;
    contractId: string;
    noticeDate: Date;
    endDate: Date;
    status: TerminationStatus;
    depositRefunded: boolean;
    depositAmount: Money | null;
    checklist: TerminationChecklist;
    createdAt: Date;
}

export class Termination {
    private constructor(private readonly props: TerminationProps) { }

    static create(props: { id: string; contractId: string; noticeDate: Date; endDate: Date; depositAmount?: number }): Termination {
        return new Termination({
            id: props.id,
            contractId: props.contractId,
            noticeDate: props.noticeDate,
            endDate: props.endDate,
            status: 'IN_PROGRESS',
            depositRefunded: false,
            depositAmount: props.depositAmount ? Money.fromDecimal(props.depositAmount) : null,
            checklist: TerminationChecklist.createDefault(),
            createdAt: new Date(),
        });
    }

    static reconstitute(props: TerminationProps): Termination { return new Termination(props); }

    get id(): string { return this.props.id; }
    get contractId(): string { return this.props.contractId; }
    get noticeDate(): Date { return this.props.noticeDate; }
    get endDate(): Date { return this.props.endDate; }
    get status(): TerminationStatus { return this.props.status; }
    get depositRefunded(): boolean { return this.props.depositRefunded; }
    get depositAmount(): Money | null { return this.props.depositAmount; }
    get checklist(): TerminationChecklist { return this.props.checklist; }

    remainingDays(now: Date = new Date()): number {
        return Math.ceil((this.props.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    canClose(): boolean { return this.checklist.isComplete() && this.props.depositRefunded; }

    updateChecklist(checklist: TerminationChecklist): Termination {
        return Termination.reconstitute({ ...this.props, checklist });
    }

    markDepositRefunded(): Termination {
        return Termination.reconstitute({ ...this.props, depositRefunded: true });
    }

    close(): Termination {
        if (!this.canClose()) throw new Error('Checklist incomplète ou caution non traitée');
        return Termination.reconstitute({ ...this.props, status: 'COMPLETED' });
    }
}
