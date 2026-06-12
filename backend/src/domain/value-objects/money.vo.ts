export class Money {
    private constructor(
        public readonly amount: number,
        public readonly currency: string = 'XOF',
    ) {
        if (amount < 0) throw new Error('Le montant ne peut pas être négatif');
    }

    static fromDecimal(amount: number, currency = 'XOF'): Money {
        return new Money(Math.round(amount * 100) / 100, currency);
    }

    static zero(currency = 'XOF'): Money {
        return new Money(0, currency);
    }

    multiply(factor: number): Money {
        return new Money(Math.round(this.amount * factor * 100) / 100, this.currency);
    }

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    toString(): string {
        return `${this.amount.toLocaleString('fr-FR')} ${this.currency}`;
    }
}
