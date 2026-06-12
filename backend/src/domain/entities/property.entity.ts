import { Address } from '../value-objects/address.vo';

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND';
export type PropertyStatus = 'OCCUPIED' | 'VACANT';

export interface PropertyProps {
    id: string;
    ownerId: string;
    designation: string;
    address: Address;
    type: PropertyType;
    status: PropertyStatus;
    createdAt: Date;
}

export class Property {
    private constructor(private readonly props: PropertyProps) { }

    static create(props: Omit<PropertyProps, 'status' | 'createdAt'>): Property {
        return new Property({ ...props, status: 'VACANT', createdAt: new Date() });
    }

    static reconstitute(props: PropertyProps): Property {
        return new Property(props);
    }

    get id(): string { return this.props.id; }
    get ownerId(): string { return this.props.ownerId; }
    get designation(): string { return this.props.designation; }
    get address(): Address { return this.props.address; }
    get type(): PropertyType { return this.props.type; }
    get status(): PropertyStatus { return this.props.status; }
    get createdAt(): Date { return this.props.createdAt; }

    isVacant(): boolean { return this.props.status === 'VACANT'; }

    markOccupied(): Property {
        return Property.reconstitute({ ...this.props, status: 'OCCUPIED' });
    }

    markVacant(): Property {
        return Property.reconstitute({ ...this.props, status: 'VACANT' });
    }

    updateDetails(update: {
        designation?: string;
        address?: Address;
        type?: PropertyType;
    }): Property {
        return Property.reconstitute({
            ...this.props,
            designation: update.designation ?? this.props.designation,
            address: update.address ?? this.props.address,
            type: update.type ?? this.props.type,
        });
    }
}
