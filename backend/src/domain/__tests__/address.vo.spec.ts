import { Address } from '../value-objects/address.vo';

describe('Address', () => {
    describe('create', () => {
        it('should create a valid address', () => {
            const addr = Address.create({ street: '123 Rue Principale', city: 'Ouagadougou', zip: '01 BP 123' });
            expect(addr.street).toBe('123 Rue Principale');
            expect(addr.city).toBe('Ouagadougou');
            expect(addr.zip).toBe('01 BP 123');
        });

        it('should throw for empty street', () => {
            expect(() => Address.create({ street: '', city: 'Test', zip: '123' }))
                .toThrow('Adresse incomplète');
        });

        it('should throw for empty city', () => {
            expect(() => Address.create({ street: 'Rue', city: '', zip: '123' }))
                .toThrow('Adresse incomplète');
        });

        it('should throw for empty zip', () => {
            expect(() => Address.create({ street: 'Rue', city: 'Test', zip: '' }))
                .toThrow('Adresse incomplète');
        });

        it('should throw for whitespace-only fields', () => {
            expect(() => Address.create({ street: '   ', city: 'Test', zip: '123' }))
                .toThrow('Adresse incomplète');
        });
    });

    describe('toString', () => {
        it('should format as street, zip city', () => {
            const addr = Address.create({ street: '10 Avenue', city: 'Bobo', zip: 'BP 456' });
            expect(addr.toString()).toBe('10 Avenue, BP 456 Bobo');
        });
    });

    describe('equals', () => {
        it('should return true for identical addresses', () => {
            const a = Address.create({ street: 'Rue', city: 'Ville', zip: '123' });
            const b = Address.create({ street: 'Rue', city: 'Ville', zip: '123' });
            expect(a.equals(b)).toBe(true);
        });

        it('should return false for different addresses', () => {
            const a = Address.create({ street: 'Rue A', city: 'Ville', zip: '123' });
            const b = Address.create({ street: 'Rue B', city: 'Ville', zip: '123' });
            expect(a.equals(b)).toBe(false);
        });
    });
});
