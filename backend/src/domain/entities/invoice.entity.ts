import { Money } from '../value-objects/money.vo';
import { Period } from '../value-objects/period.vo';

export type InvoiceStatus = 'UNPAID' | 'PAID';

export interface InvoiceProps {
    id: string;
    contractId: string;
    ownerId: string;
    periodLabel: string;
    amount: Money;
    dueDate: Date;
    status: InvoiceStatus;
    createdAt: Date;
}

export class Invoice {
    private constructor(private readonly props: InvoiceProps) { }

    static create(props: Omit<InvoiceProps, 'status' | 'createdAt'>): Invoice {
        return new Invoice({ ...props, status: 'UNPAID', createdAt: new Date() });
    }

    static reconstitute(props: InvoiceProps): Invoice { return new Invoice(props); }

    get id(): string { return this.props.id; }
    get contractId(): string { return this.props.contractId; }
    get ownerId(): string { return this.props.ownerId; }
    get periodLabel(): string { return this.props.periodLabel; }
    get amount(): Money { return this.props.amount; }
    get dueDate(): Date { return this.props.dueDate; }
    get status(): InvoiceStatus { return this.props.status; }
    get createdAt(): Date { return this.props.createdAt; }

    isPaid(): boolean { return this.props.status === 'PAID'; }
    isOverdue(now: Date = new Date()): boolean {
        return this.props.status === 'UNPAID' && this.props.dueDate < now;
    }

    markAsPaid(): Invoice {
        if (this.props.status === 'PAID') throw new Error('Facture déjà payée');
        return Invoice.reconstitute({ ...this.props, status: 'PAID' });
    }
}
