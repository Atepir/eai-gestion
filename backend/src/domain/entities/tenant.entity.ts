export interface TenantProps {
    id: string;
    ownerId: string;
    firstName: string;
    lastName: string;
    idDocumentType: string;
    idDocumentNumber: string;
    phone: string | null;
    email: string | null;
    profession: string | null;
    createdAt: Date;
}

export class Tenant {
    private constructor(private readonly props: TenantProps) { }

    static create(props: Omit<TenantProps, 'createdAt'>): Tenant {
        return new Tenant({ ...props, createdAt: new Date() });
    }

    static reconstitute(props: TenantProps): Tenant {
        return new Tenant(props);
    }

    get id(): string { return this.props.id; }
    get ownerId(): string { return this.props.ownerId; }
    get firstName(): string { return this.props.firstName; }
    get lastName(): string { return this.props.lastName; }
    get fullName(): string { return `${this.props.firstName} ${this.props.lastName}`; }
    get idDocumentType(): string { return this.props.idDocumentType; }
    get idDocumentNumber(): string { return this.props.idDocumentNumber; }
    get phone(): string | null { return this.props.phone; }
    get email(): string | null { return this.props.email; }
    get profession(): string | null { return this.props.profession; }
    get createdAt(): Date { return this.props.createdAt; }

    updateDetails(update: {
        firstName?: string;
        lastName?: string;
        idDocumentType?: string;
        idDocumentNumber?: string;
        phone?: string | null;
        email?: string | null;
        profession?: string | null;
    }): Tenant {
        return Tenant.reconstitute({
            ...this.props,
            firstName: update.firstName ?? this.props.firstName,
            lastName: update.lastName ?? this.props.lastName,
            idDocumentType: update.idDocumentType ?? this.props.idDocumentType,
            idDocumentNumber: update.idDocumentNumber ?? this.props.idDocumentNumber,
            phone: update.phone !== undefined ? update.phone : this.props.phone,
            email: update.email !== undefined ? update.email : this.props.email,
            profession: update.profession !== undefined ? update.profession : this.props.profession,
        });
    }
}
