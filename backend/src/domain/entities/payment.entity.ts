import { Money } from '../value-objects/money.vo';

export type PaymentMethod = 'CASH' | 'CHECK' | 'TRANSFER' | 'MOBILE_MONEY';

export interface PaymentProps {
    id: string;
    invoiceId: string;
    amount: Money;
    method: PaymentMethod;
    paymentDate: Date;
    reference: string | null;
    notes: string | null;
    createdAt: Date;
}

export class Payment {
    private constructor(private readonly props: PaymentProps) { }

    static create(props: Omit<PaymentProps, 'createdAt'>): Payment {
        return new Payment({ ...props, createdAt: new Date() });
    }

    static reconstitute(props: PaymentProps): Payment { return new Payment(props); }

    get id(): string { return this.props.id; }
    get invoiceId(): string { return this.props.invoiceId; }
    get amount(): Money { return this.props.amount; }
    get method(): PaymentMethod { return this.props.method; }
    get paymentDate(): Date { return this.props.paymentDate; }
    get reference(): string | null { return this.props.reference; }
    get notes(): string | null { return this.props.notes; }
}
