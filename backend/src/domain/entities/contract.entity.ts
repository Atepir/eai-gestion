import { Money } from '../value-objects/money.vo';

export type ContractStatus = 'ACTIVE' | 'NOTICE' | 'EXPIRED' | 'TERMINATED';

export interface ContractProps {
    id: string;
    ownerId: string;
    propertyId: string;
    tenantId: string;
    monthlyRent: Money;
    startDate: Date;
    endDate: Date;
    status: ContractStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Contract {
    private constructor(private readonly props: ContractProps) { }

    static create(props: Omit<ContractProps, 'status' | 'createdAt' | 'updatedAt'>): Contract {
        if (props.endDate <= props.startDate) throw new Error('La date de fin doit être après la date de début');
        return new Contract({ ...props, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() });
    }

    static reconstitute(props: ContractProps): Contract { return new Contract(props); }

    get id(): string { return this.props.id; }
    get ownerId(): string { return this.props.ownerId; }
    get propertyId(): string { return this.props.propertyId; }
    get tenantId(): string { return this.props.tenantId; }
    get monthlyRent(): Money { return this.props.monthlyRent; }
    get startDate(): Date { return this.props.startDate; }
    get endDate(): Date { return this.props.endDate; }
    get status(): ContractStatus { return this.props.status; }
    get createdAt(): Date { return this.props.createdAt; }

    isActive(): boolean { return this.props.status === 'ACTIVE' || this.props.status === 'NOTICE'; }

    markAsNotice(): Contract {
        if (!this.isActive()) throw new Error('Seul un contrat actif peut passer en préavis');
        return Contract.reconstitute({ ...this.props, status: 'NOTICE', updatedAt: new Date() });
    }

    terminate(): Contract {
        if (this.props.status === 'TERMINATED') throw new Error('Contrat déjà terminé');
        return Contract.reconstitute({ ...this.props, status: 'TERMINATED', updatedAt: new Date() });
    }

    markExpired(): Contract {
        return Contract.reconstitute({ ...this.props, status: 'EXPIRED', updatedAt: new Date() });
    }
}
