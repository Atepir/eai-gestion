export interface OwnerProps {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    createdAt: Date;
}

export class Owner {
    private constructor(private readonly props: OwnerProps) { }

    static create(props: Omit<OwnerProps, 'createdAt'>): Owner {
        return new Owner({ ...props, createdAt: new Date() });
    }

    static reconstitute(props: OwnerProps): Owner {
        return new Owner(props);
    }

    get id(): string {
        return this.props.id;
    }
    get userId(): string {
        return this.props.userId;
    }
    get name(): string {
        return this.props.name;
    }
    get email(): string {
        return this.props.email;
    }
    get phone(): string | null {
        return this.props.phone;
    }
    get address(): string | null {
        return this.props.address;
    }
    get createdAt(): Date {
        return this.props.createdAt;
    }

    updateDetails(update: { name?: string; email?: string; phone?: string | null; address?: string | null }): Owner {
        return Owner.reconstitute({
            ...this.props,
            name: update.name ?? this.props.name,
            email: update.email ?? this.props.email,
            phone: update.phone !== undefined ? update.phone : this.props.phone,
            address: update.address !== undefined ? update.address : this.props.address,
        });
    }
}
