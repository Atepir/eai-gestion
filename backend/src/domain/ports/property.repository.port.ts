import { Property } from '../entities/property.entity';

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');

export interface PropertyRepositoryPort {
    findById(id: string): Promise<Property | null>;
    findByOwnerId(ownerId: string): Promise<Property[]>;
    findAll(): Promise<Property[]>;
    create(property: Property): Promise<Property>;
    update(property: Property): Promise<Property>;
    delete(id: string): Promise<void>;
}
