export type UserRole = 'ADMIN' | 'OWNER';

export interface UserProps {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
}

export class User {
    private constructor(private readonly props: UserProps) { }

    static create(props: Omit<UserProps, 'createdAt'>): User {
        return new User({ ...props, createdAt: new Date() });
    }

    static reconstitute(props: UserProps): User {
        return new User(props);
    }

    get id(): string {
        return this.props.id;
    }
    get email(): string {
        return this.props.email;
    }
    get passwordHash(): string {
        return this.props.passwordHash;
    }
    get role(): UserRole {
        return this.props.role;
    }
    get createdAt(): Date {
        return this.props.createdAt;
    }

    isAdmin(): boolean {
        return this.props.role === 'ADMIN';
    }
}
