export interface AddressProps {
    street: string;
    city: string;
    zip: string;
}

export class Address {
    private constructor(private readonly props: AddressProps) { }

    static create(props: AddressProps): Address {
        if (!props.street.trim() || !props.city.trim() || !props.zip.trim()) {
            throw new Error('Adresse incomplète : rue, ville et code postal requis');
        }
        return new Address(props);
    }

    get street(): string {
        return this.props.street;
    }
    get city(): string {
        return this.props.city;
    }
    get zip(): string {
        return this.props.zip;
    }

    toString(): string {
        return `${this.props.street}, ${this.props.zip} ${this.props.city}`;
    }

    equals(other: Address): boolean {
        return (
            this.props.street === other.street &&
            this.props.city === other.city &&
            this.props.zip === other.zip
        );
    }
}
